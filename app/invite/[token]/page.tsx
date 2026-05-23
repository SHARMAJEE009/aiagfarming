import { getInviteByToken } from "@/lib/queries";
import { dbQueryOne } from "@/lib/db";
import { InviteAcceptForm } from "@/components/invite/InviteAcceptForm";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const invite = await getInviteByToken(token);

  if (!invite) {
    return <InviteError message="This invite link is invalid or does not exist." />;
  }
  if (invite.status !== "pending") {
    return <InviteError message="This invite has already been accepted or revoked." />;
  }
  if (new Date(invite.expires_at) < new Date()) {
    return <InviteError message="This invite link has expired. Ask the owner to resend it." />;
  }

  // Check if user already has an account with the invited email
  const existingUser = await dbQueryOne<{ id: string }>(
    `SELECT id FROM users WHERE email = $1`,
    [invite.email]
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="inline-block bg-[#1A7A3A] text-white font-bold text-xl px-5 py-2 rounded-xl">
            AIAG Farming
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">
            You&apos;ve been invited
          </h1>

          <InviteAcceptForm
            token={token}
            email={invite.email}
            orgName={invite.org_name}
            role={invite.role}
            invitedName={invite.name}
            invitedBy={invite.invited_by_name}
            userExists={!!existingUser}
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          AIAG Farming · Secure invite powered by email verification
        </p>
      </div>
    </div>
  );
}

function InviteError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <span className="inline-block bg-[#1A7A3A] text-white font-bold text-xl px-5 py-2 rounded-xl mb-8">
          AIAG Farming
        </span>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Invite Unavailable</h2>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
    </div>
  );
}