Mad Mice score-integrity notes (v1.0.8)

The client-side suspicious-run detection and client-side blocking of leaderboard submissions have been removed as requested. Online scores are submitted through the existing Supabase RPC.

Note to self: browser-side checks are not a reliable security boundary. If score integrity is needed later, enforce it on the server in the Supabase RPC.
