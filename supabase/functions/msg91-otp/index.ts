
// Follow Deno's ES Module syntax
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const AUTH_KEY = "446710AhIZBtF867fab27eP1"; // MSG91 Auth Key
const TEMPLATE_ID = "YOUR_TEMPLATE_ID"; // You'll need to set this up in MSG91 dashboard

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, action } = await req.json();
    
    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`Sending OTP ${otp} to ${phone}`);

    // Store OTP in database or memory for verification (simplified example)
    // In production, you should store this in a database with expiration
    
    // Determine which API endpoint to use based on action
    let apiUrl;
    let requestBody;

    if (action === "send") {
      // MSG91 Send OTP API
      apiUrl = "https://control.msg91.com/api/v5/otp";
      requestBody = JSON.stringify({
        template_id: TEMPLATE_ID,
        mobile: phone,
        authkey: AUTH_KEY,
        otp
      });
    } else if (action === "verify") {
      const { code } = await req.json();
      // MSG91 Verify OTP API
      apiUrl = "https://control.msg91.com/api/v5/otp/verify";
      requestBody = JSON.stringify({
        otp: code,
        mobile: phone,
        authkey: AUTH_KEY
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'send' or 'verify'" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Call MSG91 API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authkey": AUTH_KEY
      },
      body: requestBody
    });

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: action === "send" ? "OTP sent successfully" : "OTP verified successfully",
        data
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
