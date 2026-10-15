/* PRIMO portal connection settings.
 *
 * Paste the two values from Supabase -> Project Settings -> API:
 *   supabaseUrl      e.g. "https://abcdefghijkl.supabase.co"
 *   supabaseAnonKey  the "anon" / "publishable" key (safe to be public;
 *                    row-level security in supabase/schema.sql protects the data).
 *
 * NEVER paste the "service_role" / secret key here.
 */
window.PRIMO_PORTAL_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: ''
};
