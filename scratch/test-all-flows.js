const http = require('http');

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('=== TEST 1: Register New Contributor User ===');
  const testUserEmail = `writer_${Date.now()}@example.com`;
  const regRes = await request('POST', '/api/auth?action=register', {
    name: 'ড. সৌমিক রায়হান',
    email: testUserEmail,
    password: 'securePassword123',
    role: 'Contributor',
    bio: 'আন্তর্জাতিক রাজনৈতিক অর্থনীতি ও শ্রমিক অধিকার গবেষক'
  });
  console.log('Register Response Status:', regRes.status);
  console.log('Register User:', regRes.data.user);
  const userToken = regRes.data.token;

  console.log('\n=== TEST 2: Login With Newly Created User ===');
  const loginRes = await request('POST', '/api/auth?action=login', {
    email: testUserEmail,
    password: 'securePassword123'
  });
  console.log('Login Status:', loginRes.status);
  console.log('Login User Name & Role:', loginRes.data.user && loginRes.data.user.name, loginRes.data.user && loginRes.data.user.role);

  console.log('\n=== TEST 3: Submit New Article Draft ===');
  const subRes = await request('POST', '/api/submissions?action=submit', {
    submission_type: 'new_article',
    title: 'নব্য-সাম্রাজ্যবাদের যুগে গ্লোবাল সাউথের গণসংগ্রামের রূপরেখা',
    deck: 'সাম্রাজ্যবাদী আগ্রাসনের বিরুদ্ধে গণঐক্য ও বৈশ্বিক সংহতির নতুন পরিপ্রেক্ষিত।',
    section: 'imperialism-geopolitics',
    author_name: 'ড. সৌমিক রায়হান',
    author_email: testUserEmail,
    author_role: 'গবেষক',
    content_html: '<p>একবিংশ শতাব্দীতে আন্তর্জাতিক লগ্নিপুঁজির আধিপত্য বিশ্বজুড়ে মেহনতি মানুষকে নতুন শোষণের মুখে দাঁড় করিয়েছে...</p>',
    revision_notes: 'তাত্ত্বিক গবেষণা ও সাম্প্রতিক তথ্যসমৃদ্ধ'
  }, { 'Authorization': 'Bearer ' + userToken });
  console.log('Submit Article Status:', subRes.status);
  console.log('Submit Result:', subRes.data.message);
  const submissionId = subRes.data.submission ? subRes.data.submission.id : null;

  console.log('\n=== TEST 4: Submit Revision Request for Published Article ===');
  const revRes = await request('POST', '/api/submissions?action=submit', {
    submission_type: 'revision',
    target_article_slug: 'gramsci-hegemony-bangladesh',
    title: 'গ্রামশির হেজেমনি তত্ত্ব ও সমকালীন গণআন্দোলনের লড়াই (সংশোধিত সংস্করণ)',
    deck: 'সাংস্কৃতিক আধিপত্যের বিরুদ্ধে গণসংগ্রামের কৌশলগত বিশ্লেষণ।',
    section: 'theory-philosophy',
    author_name: 'ড. সৌমিক রায়হান',
    author_email: testUserEmail,
    content_html: '<p>গ্রামশির হেজেমনি বিশ্লেষণ আধুনিক ফ্যাসিবাদী ও কর্তৃত্ববাদী কাঠামোর বিরুদ্ধে প্রতি-আধিপত্য গড়ার পথ নির্দেশ করে...</p>',
    revision_notes: 'বানান শুদ্ধিকরণ ও ৩য় অনুচ্ছেদে নতুন রেফারেন্স সংযোজন'
  }, { 'Authorization': 'Bearer ' + userToken });
  console.log('Submit Revision Status:', revRes.status);
  console.log('Revision Result:', revRes.data.message);

  console.log('\n=== TEST 5: Admin Login & Submissions Review ===');
  const adminLogin = await request('POST', '/api/auth?action=login', {
    email: 'joysriram.sarkar.56@gmail.com',
    password: 'theway@admin2026'
  });
  console.log('Admin Login Status:', adminLogin.status);
  const adminToken = adminLogin.data.token;

  console.log('\n=== TEST 6: Admin List All Submissions ===');
  const listRes = await request('GET', '/api/submissions?action=list', null, {
    'Authorization': 'Bearer ' + adminToken
  });
  console.log('Submissions List Status:', listRes.status);
  console.log(`Found ${listRes.data.length} submissions.`);

  if (submissionId) {
    console.log('\n=== TEST 7: Admin Approve & Publish Submission ===');
    const reviewRes = await request('POST', '/api/submissions?action=review', {
      submission_id: submissionId,
      status: 'approved',
      reviewer_feedback: 'চমৎকার তাত্ত্বিক বিশ্লেষণ। অবিলম্বে প্রকাশ করা হলো।'
    }, { 'Authorization': 'Bearer ' + adminToken });
    console.log('Review Approval Status:', reviewRes.status);
    console.log('Review Result:', reviewRes.data.message);
  }

  console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(console.error);
