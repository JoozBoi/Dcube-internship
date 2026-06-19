import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Heart, Share2, CornerDownRight, Trash2, ShieldAlert } from 'lucide-react';
export const DetailScreen = ({
  post,
  onBackToFeed,
  onAddComment,
  onDeleteComment,
  onAddFlaggedPost,
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyTextMap, setReplyTextMap] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [isReported, setIsReported] = useState(false);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText('');
  };

  const handlePostReply = (commentId) => {
    const txt = replyTextMap[commentId];
    if (!txt || !txt.trim()) return;
    onAddComment(post.id, txt, commentId);
    setReplyTextMap(prev => ({ ...prev, [commentId]: '' }));
    setActiveReplyId(null);
  };

  const handleReportPost = () => {
    onAddFlaggedPost(post.id, post.description);
    setIsReported(true);
    alert('This post has been added to the Administrator Moderation queue for review.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="experience-detail-screen">
      {/* Back button */}
      <button
        onClick={onBackToFeed}
        className="mb-6 flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
        id="btn-back-to-feed"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discovery Feed</span>
      </button>

      {/* Header and Details */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-8" id="detail-header-card">
        {/* Author information row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-5 mb-5">
          <div className="flex items-center space-x-3">
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="font-extrabold text-gray-800 text-base">{post.author}</h4>
              <span className="text-xs text-gray-400 font-medium">Published {post.timeAgo}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReportPost}
              disabled={isReported}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition ${
                isReported 
                  ? 'bg-red-50 text-red-500 cursor-not-allowed'
                  : 'text-red-500 bg-red-50/50 hover:bg-red-50'
              }`}
              title="Report content"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isReported ? 'Reported ✓' : 'Report / Flag'}</span>
            </button>
          </div>
        </div>

        {/* Post Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight mb-4">
          {post.title}
        </h1>

        {/* Attribute Badges / Pills */}
        <div className="flex flex-wrap gap-2.5 mb-6" id="detail-attribute-pills">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{post.location}</span>
          </span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.duration}</span>
          </span>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
            Difficulty: {post.difficulty || 'Moderate'}
          </span>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
            Cost: {post.cost}
          </span>
        </div>

        {/* Narrative Description */}
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
          {post.description}
        </p>

        {/* Large Premium Hero Cover Photo */}
        <div className="rounded-2xl overflow-hidden shadow-sm aspect-video mb-8 border border-gray-100">
          <img
            src={post.imageUrl === 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlkwHhgCwaNzdYaQ-cpF4N4xk0ttNio8KiiDSIS-14uRHaBr1EoGCunGuRl8Xt_KrzzJAEr8tdkyHSphvQZ8Q36DePPWCZIQXHej8a5h8z7OBWQl8HhbD0kkBtSR6qoQi-C8JPEBnfa0SDPlP3AEnke8BTflS7EbXMA37aVpp0y3HK39pCgYKpU9xjuwtZEAkWeHlauNQw2TPMyESvH1P0NB24bD9kaD3kSr9tB5GpCLBC5Y5TokYrz1PUj8Un0nJLGRnNAdShB4Qw'
              ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQL_hnHlCXGmr5fJtCu2FJk2efWi762hHLHJ9bDu9-vkWxxyZ_1qkQOg96OUMwmEloOXZ2VxbeUPzOpQ8g_Zdbg8E29cDar79T1ajuGV27V3UQ9WcjpT4bqp9f80BZlJbvytAqfC4bYR4lfkti-Zwnf8pJ0XavBMUADjPm-zAipCKywvk91jTkAurMYSTdQOwswSmsN-XlXHe747UTHm11WopjYUO3zAnHdRaRSGFHj-gIQrdK_pkFPpb977n1dKKKeJqM892NTUli' 
              : post.imageUrl
            }
            alt={post.imageAlt}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <hr className="border-gray-50 my-6" />

        {/* Timeline Itinerary Section */}
        <div className="space-y-4" id="experience-timeline-container">
          <h3 className="text-xl font-extrabold text-gray-800 tracking-tight flex items-center mb-6">
            <span className="w-1 bg-emerald-600 h-6 rounded mr-2.5"></span>
            <span>Day-By-Day Curated Timeline</span>
          </h3>

          <div className="relative border-l border-emerald-100 pl-4 sm:pl-6 ml-3.5 space-y-8" id="experience-timeline-points">
            {post.dayByDay?.map((day, ix) => (
              <div key={ix} className="relative select-none" id={`timeline-day-point-${day.day}`}>
                {/* Visual node badge link */}
                <div className="absolute -left-7.5 sm:-left-9.5 top-1.5 w-6 h-6 rounded-full bg-emerald-600 border-4 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-4 ring-emerald-50"></div>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-base font-black text-gray-900">
                      Day {day.day}: {day.title}
                    </h4>
                    {/* Badge pills inside node */}
                    <div className="flex flex-wrap gap-1">
                      {day.badges?.map((bg, index) => (
                        <span key={index} className="px-2 py-0.5 bg-emerald-50 text-[10px] sm:text-xs text-emerald-700 font-extrabold rounded">
                          #{bg}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                    {day.description}
                  </p>

                  {/* Day specific hotlinked images (Stone statues of Otagi, mossy steps) */}
                  {day.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-gray-100 max-w-md shadow-sm aspect-video mt-4">
                      <img
                        src={day.imageUrl}
                        alt={day.imageAlt}
                        className="w-full h-full object-cover object-center"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community Discussion Board Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm" id="discussion-board-panel">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center mb-6">
          <span>Community Discussion Threads</span>
          <span className="ml-2.5 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-bold font-mono">
            {post.comments.length}
          </span>
        </h3>

        {/* Comment entry Form element */}
        <form onSubmit={handlePostComment} className="flex items-start space-x-3 mb-8" id="root-comment-form">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            alt="Current User"
            className="w-9 h-9 rounded-full object-cover border border-gray-200"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 space-y-3">
            <textarea
              required
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What do you think about this itinerary? Ask or share advice..."
              className="w-full border border-gray-200 rounded-xl p-3.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:ring-offset-1 transition"
              id="comment-input-area"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition"
                id="btn-post-comment"
              >
                Post Comment
              </button>
            </div>
          </div>
        </form>

        {/* List of comment items on details page */}
        <div className="space-y-6" id="comments-thread-lists">
          {post.comments.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-xs">
              Be the first to leave a friendly note below!
            </div>
          ) : (
            post.comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-50 pb-5 last:border-0 last:pb-0" id={`comment-node-${comment.id}`}>
                {/* Main Comment Node */}
                <div className="flex items-start space-x-3">
                  <img
                    src={comment.authorAvatar}
                    alt={comment.author}
                    className="w-9 h-9 rounded-full object-cover border border-gray-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-black text-gray-800">{comment.author}</span>
                        {comment.isVerified && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase rounded-sm">Verified</span>
                        )}
                        <span className="text-[10px] text-gray-400 font-medium">{comment.timeAgo}</span>
                      </div>
                      
                      <button
                        onClick={() => onDeleteComment(post.id, comment.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">{comment.text}</p>
                    
                    {/* Inline reply action toggler */}
                    <div className="flex items-center space-x-3 pt-1">
                      <button
                        onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                        className="text-[10px] font-black text-gray-400 hover:text-gray-800 uppercase tracking-widest"
                      >
                        {activeReplyId === comment.id ? 'Cancel' : 'Reply'}
                      </button>
                    </div>

                    {/* Active inline reply form */}
                    {activeReplyId === comment.id && (
                      <div className="mt-3 flex items-start space-x-2 p-2 bg-gray-50 border border-gray-100 rounded-lg animate-in fade-in duration-100">
                        <textarea
                          placeholder={`Write a reply to ${comment.author}...`}
                          rows={2}
                          value={replyTextMap[comment.id] || ''}
                          onChange={(e) => setReplyTextMap(prev => ({ ...prev, [comment.id]: e.target.value }))}
                          className="flex-1 border border-gray-200 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => handlePostReply(comment.id)}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-bold rounded-lg shrink-0"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub Nested comments/Replies rendering */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 pl-8 sm:pl-10 space-y-3" id={`nested-replies-list-${comment.id}`}>
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start space-x-2 bg-gray-50/50 p-3 rounded-2xl border border-gray-50" id={`reply-node-${reply.id}`}>
                        <CornerDownRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                        <img
                          src={reply.authorAvatar}
                          alt={reply.author}
                          className="w-7 h-7 rounded-full object-cover border border-gray-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[11px] font-black text-gray-800">{reply.author}</span>
                              <span className="text-[9px] text-gray-400 font-medium">{reply.timeAgo}</span>
                            </div>
                            <button
                              onClick={() => onDeleteComment(post.id, reply.id, comment.id)}
                              className="text-gray-400 hover:text-red-500 p-0.5 rounded"
                              title="Delete Reply"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-gray-600 text-xs leading-relaxed">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
