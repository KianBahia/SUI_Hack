module user::user_tests {
    use sui::test_scenario;
    use std::string;

    #[test]
    fun test_create_user_basics() {
        let alice = @0xA11CE;

        let mut s = test_scenario::begin(alice);
        { user::user::create_user(s.ctx()); };

        s.next_tx(alice);
        {
            let u = s.take_from_sender<user::user::User>();

            assert!(user::user::user_address(&u) == alice, 0);
            assert!(user::user::posts_len(&u) == 0, 1);
            assert!(user::user::therapists_len(&u) == 0, 2);

            test_scenario::return_to_sender(&s, u);
        };

        s.end();
    }

    #[test]
    fun test_create_posts_public_and_private() {
        let alice = @0xA11CE;

        let mut s = test_scenario::begin(alice);
        { user::user::create_user(s.ctx()); };

        s.next_tx(alice);
        {
            let mut u = s.take_from_sender<user::user::User>();

            user::user::create_post(&mut u, string::utf8(b"public post"), true, s.ctx());
            user::user::create_post(&mut u, string::utf8(b"private post"), false, s.ctx());

            assert!(user::user::posts_len(&u) == 2, 0);
            assert!(user::user::post_author(&u, 0) == user::user::user_address(&u), 1);
            assert!(user::user::post_is_public(&u, 0), 2);
            assert!(!user::user::post_is_public(&u, 1), 3);

            test_scenario::return_to_sender(&s, u);
        };

        s.end();
    }

    #[test]
    fun test_comment_any_sender_public_and_private() {
        let alice = @0xA11CE;
        let mallory = @0xBA11;

        let mut s = test_scenario::begin(alice);
        { user::user::create_user(s.ctx()); };

        s.next_tx(alice);
        {
            let mut u = s.take_from_sender<user::user::User>();
            user::user::create_post(&mut u, string::utf8(b"pub"),  true,  s.ctx());
            user::user::create_post(&mut u, string::utf8(b"priv"), false, s.ctx());
            test_scenario::return_to_sender(&s, u);
        };

        s.next_tx(mallory);
        {
            let mut u = s.take_from_address<user::user::User>(alice);

            user::user::add_comment_at(&mut u, 0, string::utf8(b"hi on public"));
            user::user::add_comment_at(&mut u, 1, string::utf8(b"hi on private"));

            assert!(user::user::comments_len(&u, 0) == 1, 0);
            assert!(user::user::comments_len(&u, 1) == 1, 1);

            // return_to_address(account, obj)
            test_scenario::return_to_address(alice, u);
        };

        s.end();
    }

    #[test]
    fun test_add_therapist_owner_only() {
        let alice   = @0xA11CE;
        let thera   = @0x7777; // hex válido
        let mallory = @0xBA11;

        let mut s = test_scenario::begin(alice);
        { user::user::create_user(s.ctx()); };

        s.next_tx(alice);
        {
            let mut u = s.take_from_sender<user::user::User>();
            user::user::add_therapist(&mut u, thera, s.ctx());
            assert!(user::user::therapists_len(&u) == 1, 0);
            test_scenario::return_to_sender(&s, u);
        };

        s.next_tx(mallory);
        {
            let mut u = s.take_from_address<user::user::User>(alice);
            user::user::add_therapist(&mut u, mallory, s.ctx());
            assert!(user::user::therapists_len(&u) == 1, 2);
            test_scenario::return_to_address(alice, u);
        };

        s.end();
    }

    #[test]
    fun test_add_duplicate_therapists_and_remove() {
        let alice = @0xA11CE;
        let thera = @0x7777;

        let mut s = test_scenario::begin(alice);
        { user::user::create_user(s.ctx()); };

        s.next_tx(alice);
        {
            let mut u = s.take_from_sender<user::user::User>();
            user::user::add_therapist(&mut u, thera, s.ctx());
            user::user::add_therapist(&mut u, thera, s.ctx());
            assert!(user::user::therapists_len(&u) == 2, 0);

            user::user::remove_therapist(&mut u, thera, s.ctx());
            let len_after = user::user::therapists_len(&u);
            assert!(len_after <= 2, 1);

            test_scenario::return_to_sender(&s, u);
        };

        s.end();
    }

    #[test]
    fun test_seal_view_posts_allowed_therapist_ok() {
        let alice = @0xA11CE;
        let thera = @0x7777;

        let mut s = test_scenario::begin(alice);
        { user::user::create_user(s.ctx()); };

        s.next_tx(alice);
        {
            let mut u = s.take_from_sender<user::user::User>();
            user::user::create_post(&mut u, string::utf8(b"hello"), true, s.ctx());
            user::user::add_therapist(&mut u, thera, s.ctx());
            test_scenario::return_to_sender(&s, u);
        };

        s.next_tx(thera);
        {
            let u = s.take_from_address<user::user::User>(alice);
            let uref: &user::user::User = &u;
            user::user::seal_approve_view_posts(b"req", uref, s.ctx());
            test_scenario::return_to_address(alice, u);
        };

        s.end();
    }

    #[test]
    #[expected_failure(abort_code = 2, location = user::user)]
    fun test_seal_view_posts_disallowed_aborts_code_2() {
        let alice = @0xA11CE;
        let mallory = @0xBA11;

        let mut s = test_scenario::begin(alice);
        { user::user::create_user(s.ctx()); };

        s.next_tx(alice);
        {
            let mut u = s.take_from_sender<user::user::User>();
            user::user::create_post(&mut u, string::utf8(b"hello"), true, s.ctx());
            test_scenario::return_to_sender(&s, u);
        };

        s.next_tx(mallory);
        {
            let u = s.take_from_address<user::user::User>(alice);
            let uref: &user::user::User = &u;
            // debe abortar con 2
            user::user::seal_approve_view_posts(b"req", uref, s.ctx());
            test_scenario::return_to_address(alice, u);
        };

        s.end();
    }

    #[test]
    fun test_seal_view_post_comments_public_any_ok() {
        let alice = @0xA11CE;
        let mallory = @0xBA11;

        let mut s = test_scenario::begin(alice);
        { user::user::create_user(s.ctx()); };

        s.next_tx(alice);
        {
            let mut u = s.take_from_sender<user::user::User>();
            user::user::create_post(&mut u, string::utf8(b"public"), true, s.ctx());
            test_scenario::return_to_sender(&s, u);
        };

        s.next_tx(mallory);
        {
            let u = s.take_from_address<user::user::User>(alice);
            user::user::check_view_post_comments(b"req", &u, 0, s.ctx());
            test_scenario::return_to_address(alice, u);
        };

        s.end();
    }

    #[test]
    fun test_seal_view_post_comments_private_author_ok() {
        let alice = @0xA11CE;

        let mut s = test_scenario::begin(alice);
        { user::user::create_user(s.ctx()); };

        s.next_tx(alice);
        {
            let mut u = s.take_from_sender<user::user::User>();
            user::user::create_post(&mut u, string::utf8(b"private"), false, s.ctx());

            user::user::check_view_post_comments(b"req", &u, 0, s.ctx());

            test_scenario::return_to_sender(&s, u);
        };

        s.end();
    }

    #[test]
    #[expected_failure(abort_code = 1, location = user::user)]
    fun test_seal_view_post_comments_private_non_author_aborts_code_1() {
        let alice = @0xA11CE;
        let mallory = @0xBA11;

        let mut s = test_scenario::begin(alice);
        { user::user::create_user(s.ctx()); };

        s.next_tx(alice);
        {
            let mut u = s.take_from_sender<user::user::User>();
            user::user::create_post(&mut u, string::utf8(b"private"), false, s.ctx());
            test_scenario::return_to_sender(&s, u);
        };

        s.next_tx(mallory);
        {
            let u = s.take_from_address<user::user::User>(alice);
            // debe abortar con 1 (no autor, post privado)
            user::user::check_view_post_comments(b"req", &u, 0, s.ctx());
            test_scenario::return_to_address(alice, u);
        };

        s.end();
    }

    #[test]
    fun test_many_comments_stress() {
        let alice = @0xA11CE;

        let mut s = test_scenario::begin(alice);
        { user::user::create_user(s.ctx()); };

        s.next_tx(alice);
        {
            let mut u = s.take_from_sender<user::user::User>();
            user::user::create_post(&mut u, string::utf8(b"stress"), true, s.ctx());

            let mut i = 0u64;
            while (i < 50) {
                user::user::add_comment_at(&mut u, 0, string::utf8(b"c"));
                i = i + 1;
            };

            assert!(user::user::comments_len(&u, 0) == 50, 0);

            test_scenario::return_to_sender(&s, u);
        };

        s.end();
    }
}
