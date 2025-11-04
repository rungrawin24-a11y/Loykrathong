// ===================== Firebase Config =====================
const firebaseConfig = {
  apiKey: "AIzaSyBN7ax3KboqHee5L_0_Xb4weXMXyvVRdf0",
  authDomain: "loykrathong-ae673.firebaseapp.com",
  projectId: "loykrathong-ae673",
  storageBucket: "loykrathong-ae673.firebasestorage.app",
  messagingSenderId: "251965926615",
  appId: "1:251965926615:web:59983d11c80b3073929492",
  measurementId: "G-JK3RWM0XFK"
}

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ===================== DOM Elements =====================
const btnFloat = document.getElementById("btnFloat");
const wishInput = document.getElementById("wishInput");
const floatingArea = document.getElementById("floatingArea");
const choices = document.querySelectorAll("#krathongChoices img");

let selectedKrathong = "1.png"; // default

// ===================== เลือกกระทง =====================
choices.forEach(choice => {
    choice.addEventListener("click", () => {
        choices.forEach(c => c.classList.remove("selected"));
        choice.classList.add("selected");
        selectedKrathong = choice.dataset.src;
    });
});

// ===================== SessionId =====================
const sessionId = Date.now(); // ใช้ sessionId ป้องกันโหลดกระทงเก่า

// ===================== ปุ่มลอยกระทง =====================
btnFloat.addEventListener("click", () => {
    const wishText = wishInput.value.trim();
    if (!wishText) {
        alert("กรุณาเขียนคำอธิษฐานก่อนลอยกระทง 🌕");
        return;
    }

    const krathong = {
        img: selectedKrathong,
        wish: wishText,
        time: Date.now(),
        session: sessionId
    };

    db.ref("krathongs").push(krathong);
    wishInput.value = "";
});

// ===================== ฟังข้อมูล Realtime =====================
db.ref("krathongs").on("child_added", snapshot => {
    const data = snapshot.val();

    // ไม่โหลดกระทงเก่าเกิน 2 นาที
    if (Date.now() - data.time > 2*60*1000) return;

    createKrathongElement(data.img, data.wish);
});

// ===================== สร้างกระทง =====================
function createKrathongElement(imgSrc, wishText) {
    const krathong = document.createElement("div");
    krathong.className = "krathong";

    // ✅ ชั้นใน สำหรับแอนิเมชันลอยขึ้นลง
    const inner = document.createElement("div");
    inner.className = "krathong-inner";

    // รูปกระทง
    const img = document.createElement("img");
    img.src = imgSrc;
    inner.appendChild(img);

    // คำอธิษฐาน
    const wish = document.createElement("div");
    wish.className = "wishText";
    wish.textContent = wishText;
    inner.appendChild(wish);

    // ใส่ inner ลง krathong
    krathong.appendChild(inner);
    floatingArea.appendChild(krathong);

    // ✅ กำหนดตำแหน่งเริ่ม
    const fromLeft = Math.random() < 0.5;
    const maxHeight = window.innerHeight * 0.2;
    krathong.style.bottom = Math.random() * maxHeight + "px";
    krathong.style.left = fromLeft ? "-150px" : window.innerWidth + 150 + "px";

    // ✅ ลอยแนวนอน
    const duration = 20000 + Math.random() * 5000;
    const distance = window.innerWidth + 200;
    krathong.style.transition = `transform ${duration}ms linear`;

    // ลอยไป
    setTimeout(() => {
        krathong.style.transform = fromLeft
            ? `translateX(${distance}px)`
            : `translateX(${-distance}px)`;
    }, 50);

    // ลอยกลับ
    setTimeout(() => {
        krathong.style.transition = `transform ${duration * 1.1}ms linear`;
        krathong.style.transform = fromLeft
            ? `translateX(${-distance}px)`
            : `translateX(${distance}px)`;
    }, duration + 100);

    // ลบหลังครบ 2 รอบ
    setTimeout(() => krathong.remove(), duration * 2 + 2000);
}

// ===================== ลบกระทงเก่าเกิน 2 นาทีจาก Database =====================
setInterval(() => {
    db.ref("krathongs").once("value", snapshot => {
        snapshot.forEach(child => {
            const data = child.val();
            if (Date.now() - data.time > 2*60*1000) {
                db.ref("krathongs/" + child.key).remove();
            }
        });
    });
}, 60*1000); // ตรวจทุก 1 นาที
// ===================== สุ่มแสดงกระทงทุก 20 วินาที =====================
setInterval(() => {
    db.ref("krathongs").once("value", snapshot => {
        const now = Date.now();
        const activeKrathongs = [];

        // ดึงเฉพาะที่ยังไม่หมดเวลา (ไม่เกิน 2 นาที)
        snapshot.forEach(child => {
            const data = child.val();
            if (now - data.time <= 2 * 60 * 1000) {
                activeKrathongs.push(data);
            }
        });

        // ถ้ามีกระทงเหลือ
        if (activeKrathongs.length > 0) {
            // สุ่มจำนวน 2–3 กระทง
            const numToShow = Math.floor(Math.random() * 2) + 2; // 2 หรือ 3
            const shuffled = activeKrathongs.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, numToShow);

            // แสดงผล
            selected.forEach(k => {
                createKrathongElement(k.img, k.wish);
            });
        }
    });
}, 20000); // 🔁 ทำซ้ำทุก 20 วินาที





