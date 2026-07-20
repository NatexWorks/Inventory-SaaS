import Email from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import crypto from "node:crypto";

import dbConnect from "./app/lib/db";
import User from "./app/models/userSchema";
import { consumeMagicLinkRequest } from "./app/services/authService";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Inventory SaaS";
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-inventory-secret-change-me";

// Reuses the existing Mongoose connection so NextAuth can store verification tokens in MongoDB.
async function getMongoClient() {
  await dbConnect();
  return mongoose.connection.getClient();
}

// Builds a Nodemailer transport when SMTP is configured and falls back to console logging in dev.
function createMagicLinkTransport() {
  const server = process.env.EMAIL_SERVER;
  if (server) {
    return nodemailer.createTransport(server);
  }

  return {
    async sendMail({ to, subject, text }) {
      console.log(`[auth] Magic link email for ${to}`);
      console.log(`[auth] ${subject}`);
      console.log(text);
      return { messageId: crypto.randomUUID() };
    },
  };
}

// Syncs the application user collection with the magic-link identity created by NextAuth.
async function syncAppUser(email, name) {
  const normalizedEmail = String(email || "").toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const fallbackName = String(name || normalizedEmail.split("@")[0] || "Inventory User").trim();
  return consumeMagicLinkRequest(normalizedEmail, fallbackName);
}

const emailTransport = createMagicLinkTransport();

export const authOptions = {
  trustHost: true,
  secret: AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  adapter: MongoDBAdapter(getMongoClient),
  pages: {
    signIn: "/login",
    verifyRequest: "/login?check=email",
  },
  providers: [
    Email({
      server: { jsonTransport: true },
      from: process.env.EMAIL_FROM || `Inventory SaaS <no-reply@inventory.local>`,
      maxAge: 60 * 30,
      async sendVerificationRequest({ identifier, url, provider }) {
        const subject = `Sign in to ${APP_NAME}`;
        const text = [
          `You requested a magic link for ${APP_NAME}.`,
          "",
          `Email: ${identifier}`,
          `Magic link: ${url}`,
          "",
          "If you did not request this, you can ignore this email.",
        ].join("\n");
        const html = `
          <p>You requested a magic link for <strong>${APP_NAME}</strong>.</p>
          <p><strong>Email:</strong> ${identifier}</p>
          <p><a href="${url}">Click here to sign in</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        `;

        const transport = process.env.EMAIL_SERVER ? nodemailer.createTransport(process.env.EMAIL_SERVER) : emailTransport;
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject,
          text,
          html,
        });
      },
    }),
  ],
  callbacks: {
    // Keep the JWT aligned with the app user record so route guards can read role and userId.
    async jwt({ token, user }) {
      const email = String(token.email || user?.email || "").toLowerCase();
      if (!email) {
        return token;
      }

      await dbConnect();
      let appUser = await User.findOne({ email });
      if (!appUser) {
        appUser = await syncAppUser(email, user?.name || token.name || email.split("@")[0]);
      } else if (user?.name && user.name !== appUser.name) {
        appUser.name = user.name;
        await appUser.save();
      }

      if (appUser) {
        token.sub = String(appUser._id);
        token.userId = String(appUser._id);
        token.role = appUser.role || "owner";
        token.name = appUser.name;
        token.email = appUser.email;
      }

      return token;
    },
    // Expose the custom token fields to the client session object.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || session.user.id;
        session.user.role = token.role || "owner";
        session.user.name = token.name || session.user.name;
        session.user.email = token.email || session.user.email;
      }

      return session;
    },
  },
  events: {
    // When NextAuth creates a new identity, keep the app's user collection in sync.
    async createUser({ user }) {
      await syncAppUser(user.email, user.name);
    },
  },
};
