module user::user {
    use std::string::String;
    use sui::object;
    use sui::tx_context::{Self as tx_context, TxContext};
    use sui::transfer;

    /************  Tipos  ************/

    public struct User has key, store {
        id: UID,
        address: address,
        posts: vector<Post>,
        therapistsAllowed: vector<address>,
    }

    public struct Post has key, store {
        id: UID,
        author: address,
        content: String,
        created_at: u64,
        comments: vector<String>,
        is_public: bool,
    }

    /************  API principal  ************/

    entry fun create_user(ctx: &mut TxContext) {
        let user = User {
            id: object::new(ctx),
            address: tx_context::sender(ctx),
            posts: vector::empty<Post>(),
            therapistsAllowed: vector::empty<address>(),
        };
        transfer::transfer(user, tx_context::sender(ctx));
    }

    public fun create_post(user: &mut User, content: String, is_public: bool, ctx: &mut TxContext) {
        let post = Post {
            id: object::new(ctx),
            author: user.address,
            content,
            created_at: tx_context::epoch_timestamp_ms(ctx),
            comments: vector::empty<String>(),
            is_public,
        };
        vector::push_back(&mut user.posts, post);
    }

    // Por ahora cualquiera puede comentar cualquier post
    public fun add_comment(post: &mut Post, comment: String) {
        vector::push_back(&mut post.comments, comment);
    }

    // Solo el dueño puede modificar su lista de terapeutas permitidos
    public fun add_therapist(user: &mut User, therapist: address, ctx: &mut TxContext) {
        if (tx_context::sender(ctx) == user.address) {
            vector::push_back(&mut user.therapistsAllowed, therapist);
        };
    }

    public fun remove_therapist(user: &mut User, therapist: address, ctx: &mut TxContext) {
        if (tx_context::sender(ctx) == user.address) {
            // ¡filter es macro!
            user.therapistsAllowed = vector::filter!(
                user.therapistsAllowed,
                |x| *x != therapist
            );
        };
    }

    // Seal: ver posts si el sender es un terapeuta permitido
    entry fun seal_approve_view_posts(_id: vector<u8>, user: &User, ctx: &TxContext) {
        if (!vector::contains(&user.therapistsAllowed, &tx_context::sender(ctx))) {
            abort 2
        };
    }

    // Seal: ver comentarios si el post es público o el sender es el autor
    entry fun seal_approve_view_post_comments(_id: vector<u8>, post: &Post, ctx: &TxContext) {
        if (!post.is_public && tx_context::sender(ctx) != post.author) {
            abort 1
        };
    }

    /************  Helpers públicos para tests (sin exponer campos)  ************/

    public fun user_address(u: &User): address { u.address }

    public fun posts_len(u: &User): u64 { vector::length(&u.posts) }

    public fun therapists_len(u: &User): u64 { vector::length(&u.therapistsAllowed) }

    public fun post_is_public(u: &User, idx: u64): bool {
        let p = vector::borrow(&u.posts, idx);
        p.is_public
    }

    public fun post_author(u: &User, idx: u64): address {
        let p = vector::borrow(&u.posts, idx);
        p.author
    }

    public fun comments_len(u: &User, idx: u64): u64 {
        let p = vector::borrow(&u.posts, idx);
        vector::length(&p.comments)
    }

    public fun add_comment_at(u: &mut User, idx: u64, comment: String) {
        let p = vector::borrow_mut(&mut u.posts, idx);
        add_comment(p, comment);
    }

    public fun check_view_post_comments(_id: vector<u8>, u: &User, idx: u64, ctx: &TxContext) {
        let p = vector::borrow(&u.posts, idx);
        seal_approve_view_post_comments(_id, p, ctx);
    }

    /************  Test mínimo integrado (opcional)  ************/

    #[test]
    fun test_user_post_comment_flow() {
        use sui::test_scenario;
        use std::string;

        let alice = @0xA11CE;

        let mut s = test_scenario::begin(alice);
        { create_user(s.ctx()); };

        s.next_tx(alice);
        {
            let mut u = s.take_from_sender<User>();

            assert!(user_address(&u) == alice, 0);
            assert!(posts_len(&u) == 0, 1);
            assert!(therapists_len(&u) == 0, 2);

            create_post(&mut u, string::utf8(b"hello world"), true, s.ctx());
            assert!(posts_len(&u) == 1, 3);

            assert!(post_author(&u, 0) == user_address(&u), 4);
            assert!(post_is_public(&u, 0), 5);

            add_comment_at(&mut u, 0, string::utf8(b"nice post"));
            assert!(comments_len(&u, 0) == 1, 6);

            test_scenario::return_to_sender(&s, u);
        };

        s.end();
    }
}
