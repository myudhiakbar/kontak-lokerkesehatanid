  window.addEventListener("load", () => {
    const AGREEMENT_KEY = "adsAgreementTimestamp";
    const ONE_DAY_MS = 1 * 60 * 60 * 1000; // 1 jam dalam milidetik
    const lastAgree = localStorage.getItem(AGREEMENT_KEY);
    const now = Date.now();

  // Fungsi untuk menampilkan popup konfirmasi
  function showAgreementPopup() {
      Swal.fire({
        title: "Info Penting!",
        text: "Website ini mengandung link iklan shopee affiliate. Link iklan akan redirect 1 kali saat anda klik di semua tombol dan delay 5 menit. Apakah anda setuju dengan iklan yang akan tampil di website ini?",
        input: "checkbox",
        inputValue: 0,
        inputPlaceholder: "Ya, saya setuju min",
        icon: "question",
        showCancelButton: false,
        confirmButtonText: "OK, lanjutkan",
        cancelButtonText: "Keluar",
        allowOutsideClick: false,
        allowEscapeKey: false,
        inputValidator: (value) => {
            return !value && "Kamu harus checklist setuju dulu ya!";
        },
        hideClass: { popup: 'animate__animated animate__zoomOut' }
      }).then((result) => {
        if (result.isConfirmed) {
          // Simpan waktu setuju (timestamp)
          localStorage.setItem(AGREEMENT_KEY, now.toString());
        } else {
          // Jika user tidak setuju, alihkan keluar
          window.location.href = "*";
        }
      });
    }

  // Cek apakah sudah pernah setuju dalam 24 jam terakhir
  if (!lastAgree || now - Number(lastAgree) > ONE_DAY_MS) {
      showAgreementPopup();
    }
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  // Dark Mode
  const toggleBtn = document.getElementById("darkToggle");
  const body = document.body;
  if (localStorage.getItem("darkMode") === "true") {
      body.classList.add("dark");
      toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
  }
  toggleBtn.addEventListener("click", () => {
      body.classList.toggle("dark");
      const isDark = body.classList.contains("dark");
      localStorage.setItem("darkMode", isDark);
      toggleBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });

  // === Ambil data dari Apps Script via AJAX GET ===
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyqJ4u8maNKM97iqKl511Q9K8pY5_SnJQajA6Gtt7I6-RrZfq2ZT79zbmYsmYT8Sq28/exec"; // ganti dengan URL Web App kamu

  fetch(WEB_APP_URL)
  .then(response => response.json())
  .then(data => renderLinks(data))
  .catch(err => {
      document.getElementById("linksContainer").textContent = "Gagal memuat data.";
      console.error("Error:", err);
  });

  function renderLinks(links) {
      const container = document.getElementById("linksContainer");
      container.innerHTML = "";
      
      const validLinks = links.filter(link =>
          link.url && link.url.trim() !== "" &&
          link.label && link.label.trim() !== ""
      );

      if (validLinks.length === 0) {
          container.textContent = "Tidak ada data link untuk ditampilkan.";
          return;
      }

      // Render hanya link yang valid
      validLinks.forEach(link => {
          const a = document.createElement("a");
          a.href = link.url;
          a.className = `btn ${link.color || "btn-default"}`;
          a.innerHTML = `
          ${link.icon ? `<i class="${link.icon}"></i>` : ""}
          ${link.label}
          `;
          a.target = "_blank";
          container.appendChild(a);
      });
      }

  // Daftar link sponsor (putar/acak)
  const sponsorUrls = [
      "https://s.shopee.co.id/6AcTEtdjIz",
      "https://s.shopee.co.id/5pzcqLYhyV",
      "https://s.shopee.co.id/40Xyf11I5q",
      "https://s.shopee.co.id/AKS2ChKiHa",
      "https://s.shopee.co.id/30fRTFltLp"
  ];

  const cooldown = 5 * 60 * 1000; // 5 menit dalam milidetik
  const INDEX_KEY = "sponsor-index";
  const LAST_OPEN_KEY = "directlink-last-time";

  function getNextSponsor() {
        let index = Number(localStorage.getItem(INDEX_KEY) || 0);
        const sponsor = sponsorUrls[index];
        // increment & wrap around
        index = (index + 1) % sponsorUrls.length;
        localStorage.setItem(INDEX_KEY, index);
        return sponsor;
    }

  function tryOpenSponsor() {
        const last = Number(localStorage.getItem(LAST_OPEN_KEY) || 0);
        const now = Date.now();
        if (!last || now - last > cooldown) {
            localStorage.setItem(LAST_OPEN_KEY, now);
            const sponsorUrl = getNextSponsor();
            window.open(sponsorUrl, "_blank");
        }
    }

  // === Tambahkan sponsor saat user klik link a href
  document.body.addEventListener("click", (e) => {
      const inLinksContainer = e.target.closest("#linksContainer a");
      if (inLinksContainer) {
          tryOpenSponsor();
      }
  });



