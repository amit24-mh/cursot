// netlify/functions/demo.js
export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Demo route works!" }),
  };
}

