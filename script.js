  
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
      "https://s.shopee.co.id/40Xyf11I5q",
      "https://s.shopee.co.id/AKS2ChKiHa",
      "https://s.shopee.co.id/5pzcqLYhyV",
      "https://s.shopee.co.id/30fRTFltLp"
  ];

  const cooldown = 60000; // jeda 60 detik

  function getRandomSponsor() {
      const index = Math.floor(Math.random() * sponsorUrls.length);
      return sponsorUrls[index];
  }

  function tryOpenSponsor() {
      const last = Number(localStorage.getItem("directlink-last-time") || 0);
      const now = Date.now();
      if (!last || (now - last) > cooldown) {
          localStorage.setItem("directlink-last-time", now);
          const sponsorUrl = getRandomSponsor();
          window.open(sponsorUrl, "_blank");
      }
  }

  // === Tambahkan sponsor saat user klik link a href
  document.body.addEventListener("click", (e) => {
      const inLinksContainer = e.target.closest("#linksContainer a");
      const inSocials = e.target.closest(".socials a");
      if (inLinksContainer || inSocials) {
          tryOpenSponsor();
      }
  });