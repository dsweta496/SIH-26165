const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET;

if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is missing");
}

if (!supabaseSecretKey) {
    throw new Error("SUPABASE_SECRET_KEY is missing");
}

if (!supabaseBucket) {
    throw new Error("SUPABASE_BUCKET is missing");
}


const supabase = createClient(
    supabaseUrl,
    supabaseSecretKey
);

module.exports = {
    supabase,
    supabaseBucket
};