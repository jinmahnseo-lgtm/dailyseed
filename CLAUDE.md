# CLAUDE.md - DailySeed

## 프로젝트 정보
- 경로: C:\Users\jinma\Documents\dailyseed
- 청소년 교양 교육 웹앱 "DailySeed — 매일의 씨앗"
- Next.js 16 Static Export → Cloudflare Pages (dailyseed.net)
- GitHub: jinmahnseo-lgtm/dailyseed

## 기술 스택
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- Cloudflare Pages 배포
- Google Apps Script (부모 리포트 이메일)
- Claude API (콘텐츠 자동 생성)

## 콘텐츠 구조
6개 메뉴, 모든 콘텐츠는 당일 키워드(themes.json)로 연결:
- 뉴스(news) / 고전(classic) / 예술(art) / 세계(world) / 과학(why) / 영어(english)
- 데이터: src/data/*.json (themes, news, classics, arts, worlds, whys, english, seeds)

## 콘텐츠 생성 규칙
- 영어 단어(vocab): 동사는 원형, 명사는 단수형으로 출제
- 예술(arts.json): 모든 작품에 source_url + source_label 필수 포함
- 모든 데이터는 themes.json의 당일 키워드와 연결
- `npm run generate`로 7일치 콘텐츠 자동 생성

## 작업 규칙
- 한국어로 응답
- 파일에 "AI Managed", "AI 작성" 등 AI 표기를 넣지 않는다
