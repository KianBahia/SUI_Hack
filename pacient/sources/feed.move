module pacient::feed;

use std::vector;
use sui::object::{Self, UID};
use sui::transfer;
use sui::tx_context::TxContext;

/// Feed stores a list of object addresses, not UIDs
public struct Feed has key, store {
    id: UID,
    posts: vector<address>,
}

public entry fun init_feed(ctx: &mut TxContext) {
    let feed = Feed { id: object::new(ctx), posts: vector::empty<address>() };
    transfer::public_share_object(feed);
}

public entry fun register_post(feed: &mut Feed, post_addr: address) {
    vector::push_back(&mut feed.posts, post_addr);
}

public fun get_post_addresses(feed: &Feed): &vector<address> {
    &feed.posts
}
