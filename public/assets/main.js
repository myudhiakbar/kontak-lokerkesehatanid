window.addEventListener("load", () => {
	const AGREEMENT_KEY = "adsAgreementTimestamp";
	const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik
	const lastAgree = localStorage.getItem(AGREEMENT_KEY);
	const now = Date.now();

	// Popup konfirmasi
	function showAgreementPopup() {
		Swal.fire({
			title: "Info Penting!",
			text:
				"Website ini mengandung link iklan shopee affiliate. Link iklan akan tampil 1 kali saat anda klik di semua tombol. Apakah anda setuju dengan iklan yang akan tampil di website ini?",
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
			hideClass: { popup: "animate__animated animate__zoomOut" },
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

	// Cek setuju dalam 24 jam terakhir
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
	toggleBtn.innerHTML = isDark
		? '<i class="fas fa-sun"></i>'
		: '<i class="fas fa-moon"></i>';
});

// === Ambil data dari GAS ===
const WEB_APP_URL =
	"https://script.google.com/macros/s/AKfycbyqJ4u8maNKM97iqKl511Q9K8pY5_SnJQajA6Gtt7I6-RrZfq2ZT79zbmYsmYT8Sq28/exec?site=A";

const CACHE_KEY = "gas_links_cache";

function fetchLinksSWR() {
    const container = document.getElementById("linksContainer");
    let hasCachedData = false;

    // 1. STALE: Cek dan tampilkan data dari cache terlebih dahulu
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        try {
            const parsedData = JSON.parse(cachedData);
            renderLinks(parsedData);
            hasCachedData = true;
        } catch (e) {
            console.error("Gagal membaca cache:", e);
        }
    }

    if (!hasCachedData) {
        container.textContent = "Memuat data...";
    }

    // 2. REVALIDATE: Ambil data terbaru dari server di latar belakang
    fetch(WEB_APP_URL)
        .then((response) => response.json())
        .then((data) => {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            renderLinks(data);
        })
        .catch((err) => {
            console.error("Error mengambil data dari server:", err);
            
            if (!hasCachedData) {
                container.textContent = "Gagal memuat data.";
            }
        });
}

fetchLinksSWR();

function renderLinks(links) {
    const container = document.getElementById("linksContainer");
    container.innerHTML = "";

    const validLinks = links.filter(
        (link) =>
            link.url && link.url.trim() !== "" && link.label && link.label.trim() !== "",
    );

    if (validLinks.length === 0) {
        container.textContent = "Tidak ada data link untuk ditampilkan.";
        return;
    }

    validLinks.forEach((link) => {
        const a = document.createElement("a");
        a.href = link.url;
        a.className = `btn ${link.color || "btn-default"}`;
        a.innerHTML = `
            ${link.icon ? `<i class="${link.icon}"></i>` : ""}
            ${link.label}
            `;
        // Atribut a.target = "_blank" dihapus
        container.appendChild(a);
    });
}

// Daftar link sponsor
const sponsorUrls = [
    "https://s.shopee.co.id/5VTdOhqb8i",
    "https://s.shopee.co.id/9zw2l2lBhd",
    "https://s.shopee.co.id/5fn3bNGtRA",
    "https://s.shopee.co.id/7VEhmmeezQ",
    "https://s.shopee.co.id/6ffanHfRZa",
];

const cooldown = 12 * 60 * 60 * 1000; // 12 jam dalam milidetik
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
        
        // Kembalikan true untuk menandakan sponsor berhasil dibuka
        return true; 
    }
    
    // Kembalikan false jika sedang dalam masa cooldown (sponsor tidak dibuka)
    return false; 
}

document.body.addEventListener("click", (e) => {
    const inLinksContainer = e.target.closest("#linksContainer a");
    if (inLinksContainer) {
        // Cek apakah sponsor terbuka
        const isSponsorOpened = tryOpenSponsor();
        const isMobile = window.innerWidth <= 768;
        
        // Jika sponsor terbuka, cegah link utama terbuka
        if (isSponsorOpened && !isMobile) {
            e.preventDefault();
        }
    }
});