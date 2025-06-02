export default function Notification({ message, visible }) {
  if (!visible) return null;

  return (
    <div className="notification show">
        <span>{message}</span>
    </div>
  )
}