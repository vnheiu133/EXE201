using System.Collections.Concurrent;

namespace PetSitter.WebApi.Services;

public class ChatPresenceService
{
    private readonly ConcurrentDictionary<Guid, HashSet<string>> _connectionsByUser = new();
    private readonly ConcurrentDictionary<Guid, DateTime> _lastActiveByUser = new();

    public bool Connect(Guid userId, string connectionId)
    {
        var connections = _connectionsByUser.GetOrAdd(userId, _ => new HashSet<string>());

        lock (connections)
        {
            var wasOffline = connections.Count == 0;
            connections.Add(connectionId);
            _lastActiveByUser[userId] = DateTime.UtcNow;
            return wasOffline;
        }
    }

    public bool Disconnect(Guid userId, string connectionId)
    {
        if (!_connectionsByUser.TryGetValue(userId, out var connections))
        {
            _lastActiveByUser[userId] = DateTime.UtcNow;
            return true;
        }

        lock (connections)
        {
            connections.Remove(connectionId);
            var isOffline = connections.Count == 0;

            if (isOffline)
            {
                _connectionsByUser.TryRemove(userId, out _);
                _lastActiveByUser[userId] = DateTime.UtcNow;
            }

            return isOffline;
        }
    }

    public bool IsOnline(Guid userId)
    {
        if (!_connectionsByUser.TryGetValue(userId, out var connections))
        {
            return false;
        }

        lock (connections)
        {
            return connections.Count > 0;
        }
    }

    public DateTime? GetLastActiveAt(Guid userId)
    {
        return _lastActiveByUser.TryGetValue(userId, out var lastActiveAt) ? lastActiveAt : null;
    }
}
