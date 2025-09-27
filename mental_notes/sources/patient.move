module mental_notes::patient {
    use std::string::String;
    use sui::clock::{Clock, timestamp_ms};
    use sui::tx_context::{TxContext, sender};

    use mental_notes::types::{
        Note, Allowlist,
        new_note, transfer_note,
        new_allowlist, share_allowlist,
        allowlist_owner, allowlist_add, allowlist_remove
    };

    /// Crear nota (texto plano)
    public entry fun create_note(text: String, clock: &Clock, ctx: &mut TxContext) {
        let who = sender(ctx);
        let now = timestamp_ms(clock);
        let n: Note = new_note(who, text, now, ctx);
        transfer_note(n, who);
    }

    /// Crear allowlist (una por paciente)
    public entry fun create_allowlist(ctx: &mut TxContext) {
        let who = sender(ctx);
        let a: Allowlist = new_allowlist(who, ctx);
        share_allowlist(a);
    }

    /// Dar acceso a terapeuta (solo owner)
    public entry fun grant_access(a: &mut Allowlist, therapist: address, ctx: &mut TxContext) {
        assert!(sender(ctx) == allowlist_owner(a), 1);
        allowlist_add(a, therapist);
    }

    /// Revocar acceso (solo owner)
    public entry fun revoke_access(a: &mut Allowlist, therapist: address, ctx: &mut TxContext) {
        assert!(sender(ctx) == allowlist_owner(a), 1);
        allowlist_remove(a, therapist);
    }
}
