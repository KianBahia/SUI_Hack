module mental_notes::therapist {
    use std::string::String;
    use std::option::{Self as option, Option};
    use sui::clock::{Clock, timestamp_ms};
    use sui::tx_context::{TxContext, sender};

    use mental_notes::types::{
        Reply, Allowlist, Note,
        new_reply, transfer_reply,
        note_id, note_author,
        allowlist_owner, allowlist_contains
    };

    /// Responder a una nota concreta (Reply lo recibe el paciente)
    public entry fun reply_to_note(
        allow: &Allowlist,
        note: &Note,
        text: String,
        useful_urls: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let therapist = sender(ctx);
        let patient = note_author(note);

        assert!(allowlist_owner(allow) == patient, 10);
        assert!(allowlist_contains(allow, therapist), 11);

        let now = timestamp_ms(clock);
        let r: Reply = new_reply(
            patient,
            therapist,
            option::some(note_id(note)),   // Some(ID)
            text,
            useful_urls,
            now,
            ctx
        );
        transfer_reply(r, patient);
    }

    /// Responder al paciente sin atar a una nota específica
    public entry fun reply_to_patient(
        allow: &Allowlist,
        to_patient: address,
        text: String,
        useful_urls: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let therapist = sender(ctx);

        assert!(allowlist_owner(allow) == to_patient, 12);
        assert!(allowlist_contains(allow, therapist), 13);

        let now = timestamp_ms(clock);
        let r: Reply = new_reply(
            to_patient,
            therapist,
            option::none<ID>(),            // None
            text,
            useful_urls,
            now,
            ctx
        );
        transfer_reply(r, to_patient);
    }
}
