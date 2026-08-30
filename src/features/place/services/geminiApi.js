const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function generateTravelPlanWithGemini(payload) {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  const { routeSummary, userPreferences, nearbyCandidates } = payload;

  const prompt = `
당신은 대한민국 최고의 전문 여행 플래너입니다.
제공된 여행 조건과 주변 시설 데이터를 바탕으로 현실적인 여행 일정을 수립하고, 지정된 JSON 양식으로만 응답해주세요.

[여행 기본 조건]
- 출발지: ${routeSummary.start?.name || '출발지'}
- 목적지: ${routeSummary.destination?.name || '목적지'}
- 이동수단: ${routeSummary.transportMode} (편도 예상시간: 약 ${Math.round(routeSummary.totalTimeSeconds / 60)}분, 거리: ${(routeSummary.totalDistanceMeters / 1000).toFixed(1)}km, 편도 톨비: ${routeSummary.tollFee || 0}원)
- 여행 기간: ${userPreferences.duration}
- 여행 시간대: 출발 ${userPreferences.startTime} ~ 귀가/도착 ${userPreferences.endTime}
- 카페 방문 선호도: ${userPreferences.cafePreference}
- 선호 식당/메뉴: ${userPreferences.foodPreferences.join(', ')}
- 선호 관광지/명소: ${userPreferences.spotPreferences.join(', ')}
- 추가 요청사항: ${userPreferences.extraRequirement}

[주변 후보]
식당: ${nearbyCandidates.restaurants.map((r, i) => `${i + 1}. ${r.name}(${r.category})`).join(', ')}
관광명소: ${nearbyCandidates.spots.map((s, i) => `${i + 1}. ${s.name}(${s.category})`).join(', ')}

[비용 및 일정 지침 - 엄격 준수]
1. [숙소 비용 규칙]: 숙소 항목의 estimatedCost는 반드시 0으로 설정하세요. (숙소는 하단 별도 결제 시스템에서 처리됨)
2. [활동/식사 비용 규칙]: 각 식사 및 유료 관광지에는 대한민국 물가를 반영한 1인당 현실적인 비용(예: 점심 12,000~18,000원, 저녁 15,000~30,000원)을 estimatedCost에 정확히 기재하세요.
3. 출발 시각부터 마지막 날 귀가 시각까지 완결성 있는 타임라인을 제공하세요.
4. 설명이나 마크다운 코드블록(\`\`\`json) 없이 순수한 Valid JSON 문자열만 출력하세요.

[출력 JSON 구조 예시]
{
  "tripTitle": "여행 제목",
  "summary": "여행 컨셉 소개",
  "duration": "${userPreferences.duration}",
  "totalLocalActivityCost": 65000,
  "schedule": [
    {
      "day": 1,
      "dateLabel": "1일차",
      "activities": [
        {
          "time": "${userPreferences.startTime}",
          "placeName": "장소명",
          "category": "출발 / 식사 / 관광 / 카페 / 숙소 등",
          "description": "구체적인 일정 설명",
          "estimatedCost": 15000
        }
      ]
    }
  ]
}
`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  };

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API 호출 실패 (Status: ${response.status})`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textResponse) {
    throw new Error('응답 데이터를 받아오지 못했습니다.');
  }

  return JSON.parse(textResponse);
}