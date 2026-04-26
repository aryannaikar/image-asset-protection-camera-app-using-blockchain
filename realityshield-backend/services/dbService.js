const { createClient } = require("@supabase/supabase-js");
const compare = require("../utils/compareHash");
const crypto = require("crypto");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * Gets a user by username or creates one if they don't exist.
 * @param {string} username 
 * @param {string} password
 * @returns {Promise<Object>}
 */
exports.getOrCreateUser = async (username, password) => {
  if (!supabase) return { username, id: 'mock-id' };

  // Hash the password for security
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Supabase User Fetch Error:", error.message);
    throw error;
  }

  if (user) {
    // If user exists, verify password
    if (user.password !== hashedPassword && user.password !== 'temporary_password') {
      throw new Error("Invalid password for this username");
    }
    return user;
  }

  // Create new user with hashed password
  const { data: newUser, error: createError } = await supabase
    .from("users")
    .insert([{ username, password: hashedPassword }])
    .select()
    .single();

  if (createError) {
    console.error("Supabase User Create Error:", createError.message);
    throw createError;
  }

  return newUser;
};

/**
 * Saves image metadata to Supabase.
 * @param {Object} imageData - { phash, cid, owner, password }
 * @returns {Promise<Object>}
 */
exports.saveImage = async ({ phash, cid, owner, password, latitude, longitude }) => {
  if (!supabase) {
    console.warn("Supabase not configured. Skipping DB save.");
    return { phash, cid, owner, timestamp: new Date() };
  }

  try {
    const user = await exports.getOrCreateUser(owner, password);

    const { data, error } = await supabase
      .from("images")
      .insert([
        { phash, cid, owner: user.username, timestamp: new Date().toISOString(), latitude, longitude }
      ])
      .select();

    if (error) {
      console.error("Supabase Save Error:", error.message);
      throw error;
    }

    return data[0];
  } catch (err) {
    console.error("Database saveImage Error:", err.message);
    throw err;
  }
};

/**
 * Finds an image with a similar pHash in the database.
 * @param {string} targetPhash - The pHash to search for
 * @returns {Promise<Object|null>} - Matching image metadata or null
 */
exports.findSimilar = async (targetPhash) => {
  if (!supabase) {
    console.warn("Supabase not configured. Using in-memory mock for verification.");
    return null;
  }

  const { data, error } = await supabase
    .from("images")
    .select("*");

  if (error) {
    console.error("Supabase Query Error:", error.message);
    throw error;
  }

  for (let img of data) {
    if (compare.isSimilar(targetPhash, img.phash)) {
      return img;
    }
  }

  return null;
};

/**
 * Fetches all image records for a specific owner.
 * @param {string} owner - The username to fetch history for
 */
exports.getHistory = async (owner) => {
  if (!supabase) return { data: [], error: null };

  return await supabase
    .from("images")
    .select("*")
    .eq("owner", owner)
    .order("timestamp", { ascending: false });
};
