import React, { useState } from 'react';
import type { Poll } from '../../../domains/community';
import { Button } from '../../common';
import { Vote, CheckCircle2, Clock, Users } from 'lucide-react';
import '../resident.css';
import './community.css';

export interface PollCardProps {
  poll: Poll;
  onVoteSubmit?: (pollId: string, optionId: string) => void;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, onVoteSubmit }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    poll.userVotedOptionId || null
  );

  const hasVoted = Boolean(poll.userVotedOptionId);

  const handleVote = () => {
    if (selectedOptionId && onVoteSubmit && !hasVoted) {
      onVoteSubmit(poll.id, selectedOptionId);
    }
  };

  return (
    <div className="res-poll-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="res-ann-cat-tag">Community Poll</span>
        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Clock size={11} /> Closes {poll.closingDate}
        </span>
      </div>

      <h4 className="res-poll-question">{poll.question}</h4>

      <div className="res-poll-options-list">
        {!hasVoted
          ? poll.options.map((opt) => (
              <button
                key={opt.id}
                className={`res-poll-option-btn ${selectedOptionId === opt.id ? 'selected' : ''}`}
                onClick={() => setSelectedOptionId(opt.id)}
              >
                <span>{opt.text}</span>
                <input
                  type="radio"
                  name={`poll-${poll.id}`}
                  checked={selectedOptionId === opt.id}
                  onChange={() => setSelectedOptionId(opt.id)}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
              </button>
            ))
          : poll.options.map((opt) => {
              const isUserChoice = poll.userVotedOptionId === opt.id;
              const percentage = poll.totalVotes > 0 ? Math.round((opt.votesCount / poll.totalVotes) * 100) : 0;

              return (
                <div key={opt.id} className="res-poll-result-bar-wrap">
                  <div className="res-poll-result-header">
                    <span style={{ fontWeight: isUserChoice ? 700 : 500, color: isUserChoice ? 'var(--color-primary)' : 'var(--color-text)' }}>
                      {isUserChoice && <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px', color: 'var(--color-primary)' }} />}
                      {opt.text}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      {opt.votesCount} votes ({percentage}%)
                    </span>
                  </div>

                  <div className="res-poll-bar-bg">
                    <div
                      className="res-poll-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        background: isUserChoice ? 'var(--color-primary)' : '#94a3b8',
                      }}
                    />
                  </div>
                </div>
              );
            })}
      </div>

      {!hasVoted && (
        <Button
          variant="primary"
          size="sm"
          fullWidth
          disabled={!selectedOptionId}
          onClick={handleVote}
          leftIcon={<Vote size={14} />}
        >
          Submit Vote
        </Button>
      )}

      <div className="res-poll-footer">
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Users size={11} /> {poll.totalVotes} Residents Voted
        </span>
        {hasVoted && (
          <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
            Vote Recorded
          </span>
        )}
      </div>
    </div>
  );
};
