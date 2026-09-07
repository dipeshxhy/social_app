const Comment = ({ comment }) => {
  return (
    <div className="mb-4 border-b border-gray-100 pb-3 last:border-b-0">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">{comment?.author?.username}</span>
            <span className="text-xs text-gray-400">
              {comment?.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
            </span>
          </div>
          <p className="text-sm text-gray-700">{comment?.text}</p>
        </div>
      </div>
    </div>
  );
};
export default Comment;
