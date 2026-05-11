// =============================================================
//  LinguaMedia — Configuration
//  Edit the values below to personalise your experience.
// =============================================================

const CONFIG = {

  // ------------------------------------------------------------------
  // YouTube Data API Key  (REQUIRED for video search)
  //
  // How to get a free key in ~3 minutes:
  //   1. Go to https://console.cloud.google.com/
  //   2. Create a project (or choose an existing one)
  //   3. Search "YouTube Data API v3" → Enable it
  //   4. Click "Create Credentials" → API Key
  //   5. Copy the key and paste it below (replace the placeholder)
  //
  // Free quota: 10,000 units/day (~100 searches) — more than enough.
  // ------------------------------------------------------------------
  YOUTUBE_API_KEY: 'AIzaSyDChm9vqHJ80CTZeqF8vxTfuingxarN1wo',

  // ------------------------------------------------------------------
  // Default language loaded when the page opens
  // Must match exactly one of the <option> values in index.html
  // ------------------------------------------------------------------
  DEFAULT_LANGUAGE: 'English',

  // ------------------------------------------------------------------
  // Number of video results to fetch per search (max 50)
  // ------------------------------------------------------------------
  VIDEO_RESULTS: 20,

  // ------------------------------------------------------------------
  // Number of Wikipedia article results to fetch per search
  // ------------------------------------------------------------------
  ARTICLE_RESULTS: 6,

  // ------------------------------------------------------------------
  // Your native language — translations will be FROM the learning
  // language INTO this language.
  // Supported values: 'English', 'Spanish', 'French', 'German',
  //   'Japanese', 'Chinese', 'Korean', 'Italian', 'Portuguese',
  //   'Russian', 'Arabic', 'Dutch', 'Swedish', 'Polish',
  //   'Turkish', 'Hindi'
  // ------------------------------------------------------------------
  NATIVE_LANGUAGE: 'English',

};
