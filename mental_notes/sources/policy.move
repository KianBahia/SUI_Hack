module mental_notes::policy {
    use mental_notes::types::{
        Allowlist, Note,
        allowlist_owner, allowlist_contains, note_author
    };

    /// Seal allowlist policy.
    /// - El PRIMER parámetro debe ser `id: vector<u8>` (requisito de Seal). Aquí lo ignoramos.
    /// - Pasamos explícitamente `patient` y `therapist` como args adicionales.
    /// - La policy es PURA (solo lecturas) y determinista.
    public fun seal_approve_allow(
        _id: vector<u8>,          // identidad opaque (no la usamos)
        allow: &Allowlist,        // allowlist del paciente
        note: &Note,              // nota que se desea leer
        patient: address,         // paciente dueño de la nota
        therapist: address        // terapeuta solicitante
    ) {
        // El allowlist pertenece al mismo paciente
        assert!(allowlist_owner(allow) == patient, 20);
        // La nota es de ese paciente
        assert!(note_author(note) == patient, 21);
        // El terapeuta está en la allowlist del paciente
        assert!(allowlist_contains(allow, therapist), 22);

        // Si todo pasa, la policy "aprueba" y los key-servers entregan la clave de descifrado.
    }
}
