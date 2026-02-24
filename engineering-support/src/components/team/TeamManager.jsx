"use client";

import { useMemo, useState } from "react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import LoadingState from "@/components/common/LoadingState";
import ErrorBanner from "@/components/common/ErrorBanner";
import EmptyState from "@/components/common/EmptyState";
import styles from "./TeamManager.module.css";

export default function TeamManager() {
  const {
    teamDetails,
    teamMembers,
    hasTeamAlready,
    isTeamDataLoading,
    teamManagementErrorMessage,
    loadTeamData,
    createTeam,
    inviteMemberToTeam,
    removeMemberFromTeam
  } = useTeamManagement();

  const [teamNameDraft, setTeamNameDraft] = useState("");
  const [memberIdentifierDraft, setMemberIdentifierDraft] = useState("");

  const isCreateTeamDisabled = teamNameDraft.trim() === "" || isTeamDataLoading;
  const isInviteDisabled = memberIdentifierDraft.trim() === "" || isTeamDataLoading;

  const teamAdminEmailAddress = teamDetails?.adminEmailAddress || "";

  const memberCountLabel = useMemo(() => {
    const membersCount = teamMembers.length;
    return membersCount === 1 ? "1 member" : `${membersCount} members`;
  }, [teamMembers.length]);


  async function handleCreateTeamSubmit(event) {
    event.preventDefault();

    const result = await createTeam(teamNameDraft);

    if (result.ok) {
      setTeamNameDraft("");
    }
  }

  async function handleInviteMemberSubmit(event) {
    event.preventDefault();

    const result = await inviteMemberToTeam(memberIdentifierDraft);

    if (result.ok) {
      setMemberIdentifierDraft("");
    }
  }


  async function handleRemoveMemberClick(memberUserId) {
    await removeMemberFromTeam(memberUserId);
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h2 className={styles.title}>Team management</h2>
        <p className={styles.subtitle}>
          Sezione riservata all’admin: creazione team, associazione utenti e governance.
        </p>
      </header>

      <ErrorBanner
        title="Team management error"
        message={teamManagementErrorMessage}
        onRetry={loadTeamData}
      />

      {isTeamDataLoading ? (
        <LoadingState
          title="Loading team data..."
          description="Fetching team details and members list."
        />
      ) : null}

      {!hasTeamAlready ? (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Create your team</h3>

          <form className={styles.form} onSubmit={handleCreateTeamSubmit}>
            <div className={styles.field}>
              <div className={styles.label}>Team name</div>
              <input
                className={styles.input}
                value={teamNameDraft}
                onChange={(e) => setTeamNameDraft(e.target.value)}
                placeholder="e.g. Team Alpha"
              />
            </div>

            <button className={styles.primaryButton} disabled={isCreateTeamDisabled} type="submit">
              {isTeamDataLoading ? "Creating..." : "Create team"}
            </button>
          </form>

          <p className={styles.hint}>
            Nota: l’associazione utenti dipende dal backend. Qui il frontend espone la UI e chiama gli endpoint.
          </p>
        </section>
      ) : (
        <>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Team details</h3>

            <div className={styles.detailsGrid}>
              <div>
                <strong>Name:</strong> {teamDetails?.name}
              </div>
              <div>
                <strong>Team ID:</strong> {teamDetails?.id}
              </div>
              <div>
                <strong>Admin email:</strong> {teamAdminEmailAddress}
              </div>
              <div>
                <strong>Members:</strong> {memberCountLabel}
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Invite a member</h3>

            <form className={styles.form} onSubmit={handleInviteMemberSubmit}>
              <div className={styles.field}>
                <div className={styles.label}>Email or username</div>
                <input
                  className={styles.input}
                  value={memberIdentifierDraft}
                  onChange={(e) => setMemberIdentifierDraft(e.target.value)}
                  placeholder="e.g. user@mail.com or username"
                />
                <div className={styles.hint}>
                  Il backend deve risolvere l’utente e associarlo al team.
                </div>
              </div>

              <button className={styles.primaryButton} disabled={isInviteDisabled} type="submit">
                {isTeamDataLoading ? "Inviting..." : "Invite"}
              </button>
            </form>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Team members</h3>

            {!isTeamDataLoading && teamMembers.length === 0 ? (
              <EmptyState
                title="No team members"
                description="Invite the first member to start collaborating."
              />
            ) : null}

            {teamMembers.length > 0 ? (
              <ul className={styles.membersList}>
                {teamMembers.map((memberUser) => (
                  <li className={styles.memberRow} key={memberUser.id}>
                    <div className={styles.memberInfo}>
                      <strong>{memberUser.username}</strong>
                      <div className={styles.memberMeta}>
                        {memberUser.email} • {memberUser.role} • {memberUser.plan}
                      </div>
                    </div>

                    <button
                      className={styles.dangerButton}
                      disabled={isTeamDataLoading}
                      onClick={() => handleRemoveMemberClick(memberUser.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
