import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { amenityService } from '../../../services/amenityService';
import type {
  CommunityAnnouncement,
  CommunityEvent,
  CommunityPoll,
  CommunityPost,
  RSVPStatus
} from '../../../types/amenity';
import { Modal } from '../../../components/ui/Modal';
import { CommunityMarketplaceHub } from '../../../domains/community';
import {
  Megaphone,
  Calendar,
  Vote,
  MessageSquare,
  Pin,
  ThumbsUp,
  Send,
  Plus,
  Users,
  MapPin,
  Clock,
  Sparkles,
  Tag
} from 'lucide-react';

export const ResidentCommunityHubPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';
  const residentId = currentUser?.id || 'res-1';
  const residentName = currentUser?.name || 'resident';
  const flatNumber = (currentUser as any)?.flatDetails || 'A-101';

  const [activeTab, setActiveTab] = useState<'ANNOUNCEMENTS' | 'EVENTS' | 'POLLS' | 'POSTS'>('ANNOUNCEMENTS');

  const [announcements, setAnnouncements] = useState<CommunityAnnouncement[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  // Modals state
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);

  // Post form
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<CommunityPost['category']>('GENERAL');

  // Event form
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState('');

  // Poll form
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollDesc, setPollDesc] = useState('');
  const [pollOptions, setPollOptions] = useState(['Yes', 'No']);
  const [pollExpires, setPollExpires] = useState('');

  // Comment state
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  useEffect(() => {
    loadData();
  }, [societyId]);

  const loadData = () => {
    setAnnouncements(amenityService.getAnnouncements(societyId));
    setEvents(amenityService.getEvents(societyId));
    setPolls(amenityService.getPolls(societyId));
    setPosts(amenityService.getPosts(societyId));
  };

  const handleRSVP = (eventId: string, status: RSVPStatus, guestsCount: number) => {
    amenityService.rsvpEvent(societyId, eventId, residentId, residentName, flatNumber, status, guestsCount);
    loadData();
  };

  const handleVotePoll = (pollId: string, optionId: string) => {
    amenityService.votePoll(societyId, pollId, optionId, residentId);
    loadData();
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    amenityService.createPost(societyId, residentId, residentName, flatNumber, postContent, postCategory);
    setShowCreatePostModal(false);
    setPostContent('');
    loadData();
  };

  const handleToggleLike = (postId: string) => {
    amenityService.toggleLikePost(societyId, postId, residentId);
    loadData();
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    amenityService.addCommentPost(societyId, postId, residentName, flatNumber, text);
    setCommentInputs({ ...commentInputs, [postId]: '' });
    loadData();
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate) return;

    amenityService.createEvent(societyId, eventTitle, eventDesc, eventLocation, eventDate, residentName);
    setShowCreateEventModal(false);
    setEventTitle('');
    setEventDesc('');
    setEventLocation('');
    setEventDate('');
    loadData();
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion || pollOptions.filter(o => o.trim()).length < 2) return;

    amenityService.createPoll(societyId, pollQuestion, pollDesc, pollOptions.filter(o => o.trim()), pollExpires || '2026-12-31', residentName);
    setShowCreatePollModal(false);
    setPollQuestion('');
    setPollDesc('');
    setPollOptions(['Yes', 'No']);
    loadData();
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      {/* ── Deep Navy Header Banner (#083B56) ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          borderRadius: '16px',
          padding: '1.25rem',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(8, 59, 86, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ padding: '6px', background: 'rgba(255,255,255,0.12)', color: 'var(--aarizo-sky, #83CBEA)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
              <Sparkles size={18} />
            </span>
            <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.1875rem', margin: 0, letterSpacing: '-0.02em' }}>
              Community & Discussion Hub
            </h1>
          </div>
          <p style={{ color: 'var(--aarizo-sky, #83CBEA)', fontSize: '0.75rem', margin: '0.375rem 0 0', lineHeight: 1.4 }}>
            Official announcements, events, resident polls & neighborhood forums
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {activeTab === 'POSTS' && (
            <button
              onClick={() => setShowCreatePostModal(true)}
              style={{
                background: 'var(--aarizo-blue, #176B91)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '10px',
                padding: '0.5rem 0.875rem',
                fontWeight: 700,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Create Post
            </button>
          )}
          {activeTab === 'EVENTS' && (
            <button
              onClick={() => setShowCreateEventModal(true)}
              style={{
                background: 'var(--aarizo-blue, #176B91)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '10px',
                padding: '0.5rem 0.875rem',
                fontWeight: 700,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Propose Event
            </button>
          )}
          {activeTab === 'POLLS' && (
            <button
              onClick={() => setShowCreatePollModal(true)}
              style={{
                background: 'var(--aarizo-blue, #176B91)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '10px',
                padding: '0.5rem 0.875rem',
                fontWeight: 700,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Create Poll
            </button>
          )}
        </div>
      </div>

      {/* Pill Tabs */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
          padding: '0.375rem',
          display: 'flex',
          gap: '0.375rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)',
        }}
      >
        {[
          { key: 'ANNOUNCEMENTS', label: `Announcements (${announcements.length})`, icon: Megaphone },
          { key: 'EVENTS', label: `Events & RSVP (${events.length})`, icon: Calendar },
          { key: 'POLLS', label: `Polls (${polls.length})`, icon: Vote },
          { key: 'POSTS', label: `Neighbor Feed (${posts.length})`, icon: MessageSquare },
          { key: 'DIRECTORY', label: 'Directory & Skills', icon: Users },
          { key: 'LOST_FOUND', label: 'Lost & Found', icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'var(--aarizo-light-blue, #EAF6FC)' : 'transparent',
                color: isActive ? 'var(--aarizo-blue, #176B91)' : 'var(--aarizo-text-muted, #8B9AA5)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} style={{ color: isActive ? 'var(--aarizo-blue, #176B91)' : 'var(--aarizo-text-muted, #8B9AA5)' }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANNOUNCEMENTS */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {announcements.map((ann) => (
            <div
              key={ann.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                borderLeft: ann.isPinned ? '4px solid var(--aarizo-navy, #083B56)' : '4px solid var(--aarizo-blue, #176B91)',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {ann.isPinned && <Pin size={14} style={{ color: 'var(--aarizo-navy, #083B56)', fill: 'var(--aarizo-navy, #083B56)' }} />}
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '9999px',
                      background:
                        ann.category === 'IMPORTANT'
                          ? 'var(--aarizo-danger-bg, #FFF0F1)'
                          : ann.category === 'MAINTENANCE'
                          ? 'var(--aarizo-warning-bg, #FFF8E8)'
                          : 'var(--aarizo-light-blue, #EAF6FC)',
                      color:
                        ann.category === 'IMPORTANT'
                          ? 'var(--aarizo-danger, #D9535B)'
                          : ann.category === 'MAINTENANCE'
                          ? 'var(--aarizo-warning, #D99A2B)'
                          : 'var(--aarizo-blue, #176B91)',
                    }}
                  >
                    {ann.category}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #8B9AA5)' }}>
                    By {ann.authorName}
                  </span>
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #8B9AA5)' }}>
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: '0 0 0.375rem 0' }}>
                {ann.title}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text-secondary, #657785)', margin: 0, lineHeight: 1.5 }}>
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: EVENTS */}
      {activeTab === 'EVENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(evt => {
            const userRsvp = evt.rsvps.find(r => r.residentId === residentId);
            const totalGoing = evt.rsvps.filter(r => r.status === 'GOING').reduce((acc, curr) => acc + 1 + curr.guestsCount, 0);

            return (
              <div key={evt.id} className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                      Organizer: {evt.organizerName}
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {totalGoing} Attending
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-3">{evt.title}</h3>
                  <p className="text-slate-600 text-sm mt-2">{evt.description}</p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>{evt.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>{evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Status: <strong className="text-slate-800">{userRsvp ? userRsvp.status : 'Not Responded'}</strong>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRSVP(evt.id, 'GOING', 0)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                        userRsvp?.status === 'GOING' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Going
                    </button>
                    <button
                      onClick={() => handleRSVP(evt.id, 'MAYBE', 0)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                        userRsvp?.status === 'MAYBE' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Maybe
                    </button>
                    <button
                      onClick={() => handleRSVP(evt.id, 'NOT_GOING', 0)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                        userRsvp?.status === 'NOT_GOING' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: POLLS */}
      {activeTab === 'POLLS' && (
        <div className="space-y-6">
          {polls.map(poll => {
            const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes.length, 0);

            return (
              <div key={poll.id} className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Created by {poll.createdBy}</span>
                  <span>Expires: {poll.expiresAt}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{poll.question}</h3>
                {poll.description && <p className="text-slate-500 text-xs mt-1">{poll.description}</p>}

                <div className="mt-4 space-y-3">
                  {poll.options.map(opt => {
                    const optionVotes = opt.votes.length;
                    const percent = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                    const isVoted = opt.votes.includes(residentId);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleVotePoll(poll.id, opt.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isVoted ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-sm font-medium text-slate-800">
                          <span className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`poll-${poll.id}`}
                              checked={isVoted}
                              onChange={() => {}}
                              className="text-indigo-600"
                            />
                            {opt.text}
                          </span>
                          <span className="text-xs font-bold text-slate-600">{percent}% ({optionVotes} votes)</span>
                        </div>
                        <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: POSTS / FEED */}
      {activeTab === 'POSTS' && (
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{post.authorName}</h4>
                    <p className="text-xs text-slate-400">Flat {post.flatNumber} · {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {post.category}
                </span>
              </div>

              <p className="text-slate-700 text-sm mt-4 leading-relaxed">{post.content}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                <button
                  onClick={() => handleToggleLike(post.id)}
                  className={`flex items-center gap-1 font-semibold ${
                    post.likes.includes(residentId) ? 'text-indigo-600' : 'hover:text-slate-800'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" /> {post.likes.length} Likes
                </button>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> {post.comments.length} Comments
                </span>
              </div>

              {/* Comments Section */}
              {post.comments.length > 0 && (
                <div className="mt-3 bg-slate-50 p-3 rounded-xl space-y-2">
                  {post.comments.map(c => (
                    <div key={c.id} className="text-xs">
                      <strong className="text-slate-800">{c.authorName} ({c.flatNumber}): </strong>
                      <span className="text-slate-600">{c.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post.id] || ''}
                  onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                  className="flex-1 px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: DIRECTORY */}
      {(activeTab as string) === 'DIRECTORY' && (
        <CommunityMarketplaceHub userRole="RESIDENT" initialTab="DIRECTORY" />
      )}

      {/* TAB 6: LOST & FOUND */}
      {(activeTab as string) === 'LOST_FOUND' && (
        <CommunityMarketplaceHub userRole="RESIDENT" initialTab="LOST_FOUND" />
      )}

      {/* Modal: Create Post */}
      <Modal isOpen={showCreatePostModal} onClose={() => setShowCreatePostModal(false)} title="Create Neighbor Post">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={postCategory}
              onChange={e => setPostCategory(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="GENERAL">General Discussion</option>
              <option value="RECOMMENDATION">Vendor / Worker Recommendation</option>
              <option value="BUY_SELL">Buy & Sell / Marketplace</option>
              <option value="NEIGHBORHOOD">Neighborhood Alert</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Post Content</label>
            <textarea
              rows={4}
              required
              placeholder="What would you like to share with society residents?"
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreatePostModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold rounded-lg">Publish Post</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Propose Event */}
      <Modal isOpen={showCreateEventModal} onClose={() => setShowCreateEventModal(false)} title="Propose Society Event">
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Diwali Rangoli Competition"
              value={eventTitle}
              onChange={e => setEventTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={eventDesc}
              onChange={e => setEventDesc(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Clubhouse Terrace"
                value={eventLocation}
                onChange={e => setEventLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreateEventModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold rounded-lg">Publish Event</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Poll */}
      <Modal isOpen={showCreatePollModal} onClose={() => setShowCreatePollModal(false)} title="Create Resident Poll">
        <form onSubmit={handleCreatePoll} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Question</label>
            <input
              type="text"
              required
              placeholder="e.g. Should we organize a weekend yoga class?"
              value={pollQuestion}
              onChange={e => setPollQuestion(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Poll Expiry Date</label>
            <input
              type="date"
              value={pollExpires}
              onChange={e => setPollExpires(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm mb-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Poll Options</label>
            {pollOptions.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                required
                value={opt}
                onChange={e => {
                  const updated = [...pollOptions];
                  updated[idx] = e.target.value;
                  setPollOptions(updated);
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm mb-2"
                placeholder={`Option ${idx + 1}`}
              />
            ))}
            <button
              type="button"
              onClick={() => setPollOptions([...pollOptions, ''])}
              className="px-3 py-1.5 text-indigo-600 border border-indigo-200 hover:bg-indigo-50 text-xs font-semibold rounded-lg mt-1"
            >
              + Add Option
            </button>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreatePollModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold rounded-lg">Create Poll</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

