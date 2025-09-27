module mental_notes::types {
    use std::string::String;
    use std::option::{Self as option, Option};
    use sui::object::{Self as object, UID, ID};
    use sui::table::{Self as table, Table};
    use sui::transfer;
    use sui::tx_context::TxContext;

    /// --------- Datos ----------
    public struct Note has key {
        id: UID,
        author: address,
        text: String,
        created_at_ms: u64,
    }

    public struct Allowlist has key {
        id: UID,
        owner: address,
        therapists: Table<address, bool>,
    }

    public struct Reply has key {
        id: UID,
        to_patient: address,
        from_therapist: address,
        in_reply_to: Option<ID>,   // <- ahora Option<ID>
        text: String,
        useful_urls: String,
        created_at_ms: u64,
    }

    /// Identidad para Seal
    public struct AccessKey has copy, drop {
        patient: address,
        therapist: address,
    }


    // NOTE
    public fun new_note(author: address, text: String, now_ms: u64, ctx: &mut TxContext): Note {
        Note { id: object::new(ctx), author, text, created_at_ms: now_ms }
    }
    public fun transfer_note(n: Note, to: address) { transfer::transfer(n, to) }
    public fun note_id(n: &Note): ID { object::id(n) }              // <- pasar Note, no UID
    public fun note_author(n: &Note): address { n.author }

    // ALLOWLIST
    public fun new_allowlist(owner: address, ctx: &mut TxContext): Allowlist {
        Allowlist { id: object::new(ctx), owner, therapists: table::new<address, bool>(ctx) }
    }
    public fun share_allowlist(a: Allowlist) { transfer::share_object(a) }

    public fun allowlist_owner(a: &Allowlist): address { a.owner }
    public fun allowlist_contains(a: &Allowlist, addr: address): bool {
        table::contains(&a.therapists, addr)
    }
    public fun allowlist_add(a: &mut Allowlist, addr: address) {
        if (!table::contains(&a.therapists, addr)) {
            table::add(&mut a.therapists, addr, true);
        }
    }
    public fun allowlist_remove(a: &mut Allowlist, addr: address) {
        if (table::contains(&a.therapists, addr)) {
            let _ = table::remove(&mut a.therapists, addr);
        }
    }

    // REPLY
    public fun new_reply(
        to_patient: address,
        from_therapist: address,
        in_reply_to: Option<ID>,   // <- Option<ID>
        text: String,
        useful_urls: String,
        now_ms: u64,
        ctx: &mut TxContext
    ): Reply {
        Reply {
            id: object::new(ctx),
            to_patient,
            from_therapist,
            in_reply_to,
            text,
            useful_urls,
            created_at_ms: now_ms,
        }
    }
    public fun transfer_reply(r: Reply, to: address) { transfer::transfer(r, to) }

    // --------- Getters para AccessKey (para uso en policy.move) ----------
    public fun accesskey_patient(k: &AccessKey): address { k.patient }
    public fun accesskey_therapist(k: &AccessKey): address { k.therapist }
}
