// Auth route that returns the current authenticated user.
import { failure, success } from "@/app/lib/response";
import { getAuthenticatedUser } from "@/app/lib/security";
import dbConnect from "@/app/lib/db";
import User from "@/app/models/userSchema";

export async function GET(request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth?.userId) {
      return failure("Unauthorized", null, 401);
    }

    await dbConnect();
    const user = await User.findById(auth.userId).select("-passwordHash").lean();

    if (!user) {
      return failure("Unauthorized", null, 401);
    }

    return success("Current user fetched successfully", { user });
  } catch {
    return failure("Unauthorized", null, 401);
  }
}
