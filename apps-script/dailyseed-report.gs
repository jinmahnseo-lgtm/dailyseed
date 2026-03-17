/**
 * DailySeed 미션 리포트 이메일 발송
 *
 * 배포 방법:
 * 1. https://script.google.com 에서 새 프로젝트 생성
 * 2. 이 코드를 붙여넣기
 * 3. 배포 → 새 배포 → 웹 앱 선택
 *    - 실행 주체: 나
 *    - 액세스: 모든 사용자
 * 4. 배포 URL을 MissionComplete.tsx의 APPS_SCRIPT_URL에 입력
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var studentName = data.studentName || "학생";
    var parentEmail = data.parentEmail;
    var adminEmail = data.adminEmail;
    var date = data.date;
    var keyword = data.keyword;
    var missions = data.missions || [];

    var subject = "🌱 DailySeed — " + studentName + "의 " + date + " 미션 리포트";

    var html = '<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#333;">';
    html += '<div style="background:linear-gradient(135deg,#f0fdf4,#fef9c3);padding:24px;border-radius:16px;text-align:center;margin-bottom:16px;">';
    html += '<h1 style="font-size:28px;margin:0;">🌱 DailySeed</h1>';
    html += '<p style="margin:8px 0 0;color:#666;">매일의 씨앗 — 미션 리포트</p>';
    html += '</div>';

    html += '<div style="background:#fff;padding:20px;border-radius:16px;border:1px solid #e5e7eb;margin-bottom:16px;">';
    html += '<table style="width:100%;border-collapse:collapse;">';
    html += '<tr><td style="padding:8px 0;color:#888;width:80px;">학생</td><td style="padding:8px 0;font-weight:bold;">' + studentName + '</td></tr>';
    html += '<tr><td style="padding:8px 0;color:#888;">날짜</td><td style="padding:8px 0;">' + date + '</td></tr>';
    html += '<tr><td style="padding:8px 0;color:#888;">키워드</td><td style="padding:8px 0;font-weight:bold;font-size:20px;">' + keyword + '</td></tr>';
    html += '</table>';
    html += '</div>';

    html += '<div style="background:#fff;padding:20px;border-radius:16px;border:1px solid #e5e7eb;margin-bottom:16px;">';
    html += '<h2 style="font-size:16px;margin:0 0 16px;color:#d97706;">✅ 미션 완수!</h2>';

    for (var i = 0; i < missions.length; i++) {
      var m = missions[i];
      html += '<div style="padding:12px;background:#f9fafb;border-radius:12px;margin-bottom:8px;">';
      html += '<p style="margin:0;font-weight:600;font-size:14px;">' + m.label + '</p>';
      if (m.answer) {
        html += '<p style="margin:4px 0 0;font-size:13px;color:#555;">' + m.answer + '</p>';
      }
      html += '</div>';
    }

    html += '</div>';

    html += '<p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">';
    html += '이 메일은 DailySeed 앱에서 자동 발송되었습니다.';
    html += '</p>';
    html += '</div>';

    // 부모 이메일로 발송
    if (parentEmail) {
      MailApp.sendEmail({
        to: parentEmail,
        subject: subject,
        htmlBody: html
      });
    }

    // 관리자 이메일로 발송
    if (adminEmail && adminEmail !== parentEmail) {
      MailApp.sendEmail({
        to: adminEmail,
        subject: "[관리자] " + subject,
        htmlBody: html
      });
    }

    // 스프레드시트에 로그 기록 (선택사항)
    logToSheet(data);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function logToSheet(data) {
  try {
    // DailySeed 리포트 로그 시트 (자동 생성)
    var ss;
    var files = DriveApp.getFilesByName("DailySeed_Reports");
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create("DailySeed_Reports");
    }

    var sheet = ss.getSheetByName("리포트") || ss.insertSheet("리포트");

    // 헤더가 없으면 추가
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "타임스탬프", "학생", "날짜", "키워드",
        "📰 찬반토론", "📖 질문", "🎨 작품평",
        "🌍 퀴즈", "🔬 실험", "📝 단어",
        "부모이메일"
      ]);
    }

    var missions = data.missions || [];
    var answers = missions.map(function(m) { return m.answer || "완료"; });

    sheet.appendRow([
      new Date(),
      data.studentName,
      data.date,
      data.keyword,
      answers[0] || "",
      answers[1] || "",
      answers[2] || "",
      answers[3] || "",
      answers[4] || "",
      answers[5] || "",
      data.parentEmail
    ]);
  } catch (e) {
    // 로그 실패는 무시 (이메일 발송이 더 중요)
    Logger.log("Sheet log error: " + e.toString());
  }
}

// GET 요청 처리 (테스트용)
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "DailySeed Report API is running" })
  ).setMimeType(ContentService.MimeType.JSON);
}
