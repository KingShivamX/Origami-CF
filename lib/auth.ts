import jwt from "jsonwebtoken";

interface UserPayload {
  userId: string;
  iat: number;
  exp: number;
}

export async function verifyAuth(token: string): Promise<UserPayload | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
