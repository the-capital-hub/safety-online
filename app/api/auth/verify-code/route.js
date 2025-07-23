import Verification from '@/model/Verification.js';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req) {
  await dbConnect();
  const { email, code } = await req.json();

  const record = await Verification.findOne({ email });

  if (!record || record.code !== code || record.expiresAt < Date.now()) {
    return Response.json({ message: 'Invalid or expired code' }, { status: 400 });
  }

  // Optionally: delete after verification
  // await Verification.deleteOne({ email });

  return Response.json({ message: 'Email verified successfully' });
}
