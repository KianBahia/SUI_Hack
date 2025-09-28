module pacient::database {
    use sui::object::{Self, UID, ID, new};  // <-- You need to import ID here!
    use sui::tx_context::{TxContext, sender};
    use sui::transfer;
    use std::vector;

    public struct NoteEntry has copy, drop, store {
        author: address,
        note_id: ID,  // ✅ Good — ID is correct type
    }

    public struct Database has key {
        id: UID,
        notes: vector<NoteEntry>,
    }

    public entry fun create(ctx: &mut TxContext) {
        let db = Database {
            id: new(ctx),
            notes: vector::empty<NoteEntry>(),
        };
        transfer::share_object(db); // ✅ Creates shared object
    }

    public entry fun add_note(db: &mut Database, author: address, note_id: ID) {
        let entry = NoteEntry { author, note_id };
        vector::push_back(&mut db.notes, entry);
    }
}
