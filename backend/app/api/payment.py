import razorpay
import hmac
import hashlib
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from app.config.settings import settings

router = APIRouter()

razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

class OrderRequest(BaseModel):
    amount: int  # in rupees

@router.post("/create-order")
async def create_order(order: OrderRequest):
    try:
        amount_paise = order.amount * 100
        print(f"📦 Creating order for amount: {amount_paise}")

        razorpay_order = razorpay_client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1
        })

        print("✅ Razorpay order created:", razorpay_order)
        return {
            "order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
        }

    except Exception as e:
        print("❌ Razorpay error:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-payment")
async def verify_payment(request: Request):
    try:
        body = await request.json()
        order_id = body.get("razorpay_order_id")
        payment_id = body.get("razorpay_payment_id")
        signature = body.get("razorpay_signature")

        generated_signature = hmac.new(
            bytes(settings.RAZORPAY_KEY_SECRET, "utf-8"),
            bytes(order_id + "|" + payment_id, "utf-8"),
            hashlib.sha256
        ).hexdigest()

        if generated_signature == signature:
            return {"status": "success"}
        else:
            raise HTTPException(status_code=400, detail="Invalid signature")

    except Exception as e:
        print("❌ Payment verification failed:", e)
        raise HTTPException(status_code=500, detail=str(e))
