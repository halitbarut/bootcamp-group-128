import google.generativeai as genai
from fastapi import HTTPException
import re
import schemas
from config import settings

model = genai.GenerativeModel(settings.ai_model)


def generate_question_with_ai(original_question: str) -> schemas.GeminiQuestionResponse:
    """
    Verilen bir metne dayanarak AI kullanarak yeni bir soru üretir.
    """
    prompt = f"""
    GÖREV: Aşağıdaki örnek soruya konu, format ve zorluk seviyesi olarak çok benzeyen yeni bir çoktan seçmeli soru oluştur.

    ÖRNEK SORU:
    "{original_question}"

    KURALLAR:
    1.  Cevabın SADECE ve SADECE bir JSON nesnesi olmalı.
    2.  JSON dışında kesinlikle hiçbir metin ekleme.
    3.  Oluşturulan JSON nesnesi, aşağıdaki yapıya birebir uymalıdır:
        {{
          "question": "Oluşturulan yeni sorunun metni buraya gelecek.",
          "options": [
            {{"options": "A", "text": "A şıkkının metni"}},
            {{"options": "B", "text": "B şıkkının metni"}},
            {{"options": "C", "text": "C şıkkının metni"}},
            {{"options": "D", "text": "D şıkkının metni"}}
          ],
          "correct_ans": "Doğru şıkkın harfi (örn: 'B')"
        }}
    """
    try:
        response = model.generate_content(prompt)

        cleaned_text = response.text.strip().replace("```json", "").replace("```", "").strip()

        return schemas.GeminiQuestionResponse.model_validate_json(cleaned_text)

    except Exception as e:
        print(f"AI Soru Üretme Hatası: {e}")
        raise HTTPException(status_code=500, detail="Yapay zeka ile soru üretilirken bir hata oluştu.")


def explain_question_with_ai(request: schemas.ExplainQuestionRequest) -> schemas.QuestionExplanationResponse:
    options_text = "\n".join([f"{opt.options}) {opt.text}" for opt in request.options])
    user_context_prompt = ""
    instruction_prompt = ""

    if request.user_answer:
        if request.user_answer == request.correct_answer:
            user_context_prompt = f"KULLANICININ CEVABI: {request.user_answer} (DOĞRU)"
            instruction_prompt = "Kullanıcı soruyu doğru cevapladı. Onu tebrik ederek başla. Ardından, bu şıkkın neden doğru olduğunu ve diğer önemli şıkların neden yanlış olduğunu basit ve anlaşılır bir dille açıkla."
        else:
            user_context_prompt = f"KULLANICININ CEVABI: {request.user_answer} (YANLIŞ)"
            instruction_prompt = f"Kullanıcı soruyu yanlış cevapladı. Nazik bir dille yanlış cevap verdiğini belirt. Önce doğru cevabın ({request.correct_answer}) neden doğru olduğunu anlat. Sonra, kullanıcının seçtiği şıkkın ({request.user_answer}) neden yaygın bir hata olduğunu veya neden yanlış olduğunu özellikle vurgulayarak açıkla."
    else:
        instruction_prompt = f"Kullanıcı bu soruya cevap vermedi. Doğrudan konuya girerek doğru cevabın ({request.correct_answer}) neden doğru olduğunu ve diğer şıkların neden çeldirici veya yanlış olduğunu detaylıca anlat."

    prompt = f"""
    GÖREV: Sen yardımcı bir öğretmensin. Aşağıda verilen çoktan seçmeli soruyu, talimatlara uyarak açıkla.

    --- SORU BİLGİLERİ ---
    SORU: {request.question}
    ŞIKLAR:\n{options_text}
    DOĞRU CEVAP: {request.correct_answer}
    {user_context_prompt}
    --- BİTTİ ---

    TALİMAT:
    {instruction_prompt}

    KURALLAR:
    1. Cevabın sadece ve sadece açıklama metni olsun.
    2. Açıklama dışında hiçbir ekleme yapma.
    """
    try:
        response = model.generate_content(prompt)
        raw_explanation = response.text
        cleaned_explanation = re.sub(r'[\*]', '', raw_explanation).strip()
        return schemas.QuestionExplanationResponse(explanation=cleaned_explanation)
    except Exception as e:
        print(f"AI Açıklama Üretme Hatası: {e}")
        raise HTTPException(status_code=500, detail="Yapay zeka ile açıklama üretilirken bir hata oluştu.")