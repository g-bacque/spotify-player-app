// SpotifyAuth.js
import { generateRandomString, generateCodeChallenge } from './Helpers';

const CLIENT_ID = '61426bb5caf84efe8690b2ef870b77e6';
const REDIRECT_URI = 'https://spotifycrossfadeplayer.netlify.app';
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'streaming',
  'user-modify-playback-state',
  'user-read-playback-state'
];


export async function redirectToSpotifyLogin() {
  const codeVerifier = generateRandomString(128);
  localStorage.setItem('code_verifier', codeVerifier);
  console.log("✅ Guardando code_verifier:", codeVerifier); // 👈 Asegúrate de verlo
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    scope: SCOPES.join(' ')
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  window.location = authUrl;
}

export async function getAccessToken(code) {
  const codeVerifier = localStorage.getItem('code_verifier');
  console.log("🔍 Recuperado code_verifier:", codeVerifier); // 👈 Este debe mostrarlo
  if (!codeVerifier) {
    console.error("❌ No se encontró code_verifier en localStorage");
    return null;
  }

  const data = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: data.toString()
  });

  const result = await response.json();
  if (result.access_token) {
    localStorage.setItem('access_token', result.access_token);
    return result.access_token;
  } else {
    console.error("❌ Error al obtener token:", result);
    return null;
  }
}
