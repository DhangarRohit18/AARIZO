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
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Community & Discussion Hub</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Stay updated with official announcements, upcoming society events, resident polls, and neighbor forums.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'POSTS' && (
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Post
            </button>
          )}
          {activeTab === 'EVENTS' && (
            <button
              onClick={() => setShowCreateEventModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Propose Event
            </button>
          )}
          {activeTab === 'POLLS' && (
            <button
              onClick={() => setShowCreatePollModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Poll
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-2 rounded-t-2xl space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ANNOUNCEMENTS' as any)}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === ('ANNOUNCEMENTS' as any) ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Megaphone className="w-4 h-4" /> Announcements ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('EVENTS' as any)}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === ('EVENTS' as any) ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" /> Events & RSVP ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('POLLS' as any)}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === ('POLLS' as any) ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Vote className="w-4 h-4" /> Society Polls ({polls.length})
        </button>
        <button
          onClick={() => setActiveTab('POSTS' as any)}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === ('POSTS' as any) ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Neighbor Feed ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('DIRECTORY' as any)}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === ('DIRECTORY' as any) ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" /> Directory & Skills
        </button>
        <button
          onClick={() => setActiveTab('LOST_FOUND' as any)}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === ('LOST_FOUND' as any) ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Tag className="w-4 h-4" /> Lost & Found
        </button>
      </div>

      {/* TAB 1: ANNOUNCEMENTS */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="space-y-4">
          {announcements.map(ann => (
            <div key={ann.id} className={`bg-white p-4 md:p-6 rounded-2xl border shadow-sm border-l-4 ${ann.isPinned ? 'border-l-indigo-600 bg-indigo-50/20' : 'border-slate-200 border-l-slate-300'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ann.isPinned && <Pin className="w-4 h-4 text-indigo-600 fill-indigo-600" />}
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    ann.category === 'IMPORTANT' ? 'bg-rose-100 text-rose-800' :
                    ann.category === 'MAINTENANCE' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {ann.category}
                  </span>
                  <span className="text-xs text-slate-400">By {ann.authorName}</span>
                </div>
                <span className="text-xs text-slate-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-2">{ann.title}</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">{ann.content}</p>
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
                    <p className="text-xs text-slate-400">Flat {post.flatNumber} â€¢ {new Date(post.createdAt).toLocaleDateString()}</p>
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

