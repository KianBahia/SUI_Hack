/*
/// Module: pacient
module pacient::pacient;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions


module pacient::pacient {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::{Self, String};

    public struct Note has key {
        id: UID,
        author: address,
        content: String,
        timestamp_ms: u64,
    }

    public entry fun post(content: String, ctx: &mut TxContext) {
        let note = Note {
            id: object::new(ctx),
            author: tx_context::sender(ctx),
            content,
            timestamp_ms: tx_context::epoch_timestamp_ms(ctx),
        };
        transfer::transfer(note, tx_context::sender(ctx));
    }
}
