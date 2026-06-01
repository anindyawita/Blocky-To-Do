"use client";

import { useState, useEffect, useRef } from "react";

// Sample Pixel Game Launch Draft (Preloaded in Demo)
const SAMPLE_JOURNAL_DRAFT = `Tim Developer Piksel:
Target Rilis: Q3 2026

**Desain Karakter: Evaluasi visual maskot stroberi utama.
Desain maskot stroberi sudah sangat imut dan menggemaskan! (5/5)

**Poin Perbaikan Teknis: Apa saja aspek bug game yang perlu diselesaikan?
Aspek Kuat:
- Efek letusan partikel bintang berjalan sangat halus di browser handphone.
Perbaikan dan Saran:
- Perbaiki bug warna pita kelinci yang tidak sengaja berubah menjadi hijau saat melompat.
- Mengapa tombol navigasi utama di layar mobile terasa terlalu kecil? Tolong perbesar ukurannya agar mudah dipencet.

Tim Audio Chiptune:
Target Musik: Selesai Minggu Ini

**Aspek Sound & SFX: Evaluasi lagu tema latar belakang game.
1. Musik chiptune retro double-tone ding sudah sangat cocok dengan nuansa blocky!
2. Tambahkan suara melodi riang saat pemain berhasil naik level.
3. Struktur audio game secara lengkap tolong dicantumkan di buku panduan game.`;

// Prompt system template
const SYSTEM_PROMPT_TEMPLATE = `Tolong rapihkan draf masukan saya di bawah ini agar menjadi daftar to-do list yang terstruktur dan rapi untuk aplikasi "Blocky Todo".

Aturan penulisan yang wajib diikuti:
1. Bagi draf menjadi beberapa bagian/section utama yang logis.
2. Setiap section ditandai dengan nama section diikuti tanda titik dua (:) di baris tersendiri. Contoh: "Reviewer A:" atau "Bab 1: Pendahuluan" atau "Masukan Desain:".
3. Setiap tugas atau tindakan di bawah section harus ditulis di baris baru dan diawali tanda minus (-) diikuti satu spasi. Contoh: "- Memperbaiki overlapping judul pada Tabel 2 dan 3".
4. Buat kalimat tugas tersebut singkat, jelas, padat, dan berorientasi aksi (diawali kata kerja seperti Perbaiki, Tambahkan, Analisis, Sesuaikan, Hapus, Cek, dll).
5. Jangan lewatkan poin penting apa pun dari draf asli saya. Semua harus terangkum secara detail menjadi poin checklist tersendiri.

Berikut adalah draf masukan saya yang berantakan:
---
[TEMPEL DRAF KAMU DI SINI]
---`;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  
  // Auth state
  const [authUser, setAuthUser] = useState(null); // { email }
  const [authTab, setAuthTab] = useState("login"); // "login" | "register"
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");

  // Input fields state
  const [draftText, setDraftText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🍓");

  // Inline editing state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");

  // Project Dropdown menu state
  const [activeDropdownProjectId, setActiveDropdownProjectId] = useState(null);
  
  // Project Rename state (reuse project creation modal style)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameProjectName, setRenameProjectName] = useState("");
  const [renameProjectId, setRenameProjectId] = useState(null);

  // Onboarding Tour state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Particles state
  const [sparkles, setSparkles] = useState([]);
  
  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [isToastSuccess, setIsToastSuccess] = useState(true);
  const [isToastVisible, setIsToastVisible] = useState(false);

  // 1. Resolve Next.js hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Click outside handler to close project dropdown menus
  useEffect(() => {
    if (!mounted) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".project-dropdown-container")) {
        setActiveDropdownProjectId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [mounted]);

  // 3. Load Auth & State from localStorage on Mount
  useEffect(() => {
    if (!mounted) return;

    try {
      // Check auth session
      const savedAuth = localStorage.getItem("blocky_todo_auth_user");
      if (savedAuth) {
        const user = JSON.parse(savedAuth);
        setAuthUser(user);

        // Load project state for this specific user
        const savedState = localStorage.getItem(`blocky_todo_next_state_${user.email}`);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          if (parsed && parsed.projects) {
            setProjects(parsed.projects);
            setActiveProjectId(parsed.activeProjectId || (parsed.projects[0] ? parsed.projects[0].id : null));
          }
        } else {
          // If no state exists, start empty []
          setProjects([]);
          setActiveProjectId(null);
        }

        // Trigger onboarding tour if not completed
        const hasCompletedOnboarding = localStorage.getItem(`blocky_todo_onboarding_completed_${user.email}`);
        if (!hasCompletedOnboarding) {
          setIsOnboardingOpen(true);
          setOnboardingStep(0);
        }
      }
    } catch (e) {
      console.error("Failed to load localstorage state", e);
    }
  }, [mounted]);

  // 4. Save State to localStorage whenever projects/activeProjectId changes (for the active authUser)
  useEffect(() => {
    if (!mounted || !authUser) return;
    try {
      localStorage.setItem(
        `blocky_todo_next_state_${authUser.email}`,
        JSON.stringify({ projects, activeProjectId })
      );
    } catch (e) {
      console.error("Failed to save state to localstorage", e);
    }
  }, [projects, activeProjectId, authUser, mounted]);

  // 5. Helper Get Active Project
  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  // 6. Success Toast Trigger
  const triggerToast = (message, isSuccess = true) => {
    setToastMessage(message);
    setIsToastSuccess(isSuccess);
    setIsToastVisible(true);

    setTimeout(() => {
      setIsToastVisible(false);
    }, 2800);
  };

  // 7. Chiptune sound synthesis via Web Audio API (100% offline, retro coin/sparkle chime!)
  const playCuteSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      const now = ctx.currentTime;
      
      // High-pitched retro double note slide (sweet 8-bit sound!)
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.08); // A5 (instantly slides higher!)
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35); // quick fade out
      
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn("AudioContext not allowed or blocked by autoplay browser restrictions", e);
    }
  };

  // 8. Particle Sparkle burst generator
  const triggerSparkles = (x, y) => {
    const emojis = ["✨", "💖", "🌸", "🍓", "🎀", "🧸", "⭐"];
    const newSparkles = [];

    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 90 + 30;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;

      newSparkles.push({
        id: `sparkle_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}`,
        x,
        y,
        dx,
        dy,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      });
    }

    setSparkles(prev => [...prev, ...newSparkles]);

    // Cleanup particles
    setTimeout(() => {
      setSparkles(prev => prev.filter(p => !newSparkles.some(ns => ns.id === p.id)));
    }, 1200);
  };

  // 9. Toggle Task state
  const handleToggleTask = (sectionId, taskId, checked, e) => {
    // Sparkles & Sound on check
    if (checked && e) {
      const rect = e.target.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      const clickX = rect.left + rect.width / 2 + scrollX;
      const clickY = rect.top + rect.height / 2 + scrollY;

      triggerSparkles(clickX, clickY);
      playCuteSound(); // plays the beautiful retro synth chime!
      triggerToast("Tugas selesai! XP bertambah 💖");
    }

    setProjects(prev =>
      prev.map(proj => {
        if (proj.id !== activeProjectId) return proj;
        return {
          ...proj,
          sections: proj.sections.map(sect => {
            if (sect.id !== sectionId) return sect;
            return {
              ...sect,
              tasks: sect.tasks.map(t => {
                if (t.id !== taskId) return t;
                return { ...t, checked };
              })
            };
          })
        };
      })
    );
  };

  // 10. Delete Project
  const handleDeleteProject = (id) => {
    const projToDelete = projects.find(p => p.id === id);
    if (!projToDelete) return;

    if (confirm(`Apakah kamu yakin ingin menghapus proyek "${projToDelete.name}"? 🧸`)) {
      const newProjs = projects.filter(p => p.id !== id);
      setProjects(newProjs);

      if (activeProjectId === id) {
        setActiveProjectId(newProjs.length > 0 ? newProjs[0].id : null);
      }

      triggerToast(`Proyek "${projToDelete.name}" berhasil dihapus 🧸`);
    }
  };

  // 11. Rename Project (Modal Trigger)
  const handleRenameProjectModalOpen = (id) => {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    setRenameProjectId(id);
    setRenameProjectName(proj.name);
    setIsRenameModalOpen(true);
  };

  // 12. Save Project Rename
  const handleSaveProjectRename = () => {
    const name = renameProjectName.trim();
    if (!name) {
      alert("Nama proyek tidak boleh kosong! 🎀");
      return;
    }

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== renameProjectId) return p;
        return { ...p, name };
      })
    );
    setIsRenameModalOpen(false);
    triggerToast("Nama proyek berhasil diubah! ✨");
  };

  // 13. Add Manual Section
  const handleAddSection = () => {
    if (!activeProject) return;

    const colors = ["pink", "yellow", "violet", "blue"];
    const colorClass = colors[activeProject.sections.length % colors.length];

    const newSect = {
      id: `sect_${Date.now()}`,
      title: "Section Baru 🌸",
      color: colorClass,
      tasks: []
    };

    setProjects(prev =>
      prev.map(proj => {
        if (proj.id !== activeProjectId) return proj;
        return {
          ...proj,
          sections: [...proj.sections, newSect]
        };
      })
    );

    // Trigger editing for this new section immediately
    setEditingSectionId(newSect.id);
    setEditingSectionTitle("Section Baru 🌸");
  };

  // 14. Rename Section
  const handleSaveSectionRename = (sectionId) => {
    if (!editingSectionTitle.trim()) {
      setEditingSectionId(null);
      return;
    }

    setProjects(prev =>
      prev.map(proj => {
        if (proj.id !== activeProjectId) return proj;
        return {
          ...proj,
          sections: proj.sections.map(sect => {
            if (sect.id !== sectionId) return sect;
            return { ...sect, title: editingSectionTitle.trim() };
          })
        };
      })
    );
    setEditingSectionId(null);
  };

  // 15. Delete Section
  const handleDeleteSection = (sectionId) => {
    if (confirm("Apakah kamu yakin ingin menghapus section ini beserta semua tugas di dalamnya? 🧸")) {
      setProjects(prev =>
        prev.map(proj => {
          if (proj.id !== activeProjectId) return proj;
          return {
            ...proj,
            sections: proj.sections.filter(s => s.id !== sectionId)
          };
        })
      );
      triggerToast("Section berhasil dihapus 🧸");
    }
  };

  // 16. Add Task to specific section
  const handleAddTaskSubmit = (e, sectionId) => {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector(".task-input");
    const text = input.value.trim();

    if (!text) return;

    const newTask = {
      id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      text,
      checked: false
    };

    setProjects(prev =>
      prev.map(proj => {
        if (proj.id !== activeProjectId) return proj;
        return {
          ...proj,
          sections: proj.sections.map(sect => {
            if (sect.id !== sectionId) return sect;
            return { ...sect, tasks: [...sect.tasks, newTask] };
          })
        };
      })
    );

    input.value = "";
  };

  // 17. Save Edited Task
  const handleSaveTaskEdit = (sectionId, taskId) => {
    if (!editingTaskText.trim()) {
      setEditingTaskId(null);
      return;
    }

    setProjects(prev =>
      prev.map(proj => {
        if (proj.id !== activeProjectId) return proj;
        return {
          ...proj,
          sections: proj.sections.map(sect => {
            if (sect.id !== sectionId) return sect;
            return {
              ...sect,
              tasks: sect.tasks.map(t => {
                if (t.id !== taskId) return t;
                return { ...t, text: editingTaskText.trim() };
              })
            };
          })
        };
      })
    );
    setEditingTaskId(null);
  };

  // 18. Delete Task
  const handleDeleteTask = (sectionId, taskId) => {
    setProjects(prev =>
      prev.map(proj => {
        if (proj.id !== activeProjectId) return proj;
        return {
          ...proj,
          sections: proj.sections.map(sect => {
            if (sect.id !== sectionId) return sect;
            return {
              ...sect,
              tasks: sect.tasks.filter(t => t.id !== taskId)
            };
          })
        };
      })
    );
  };

  // 19. SMART LOCAL PARSER (Zero-API Core Magic!)
  const handleParseDraft = () => {
    const text = draftText.trim();
    if (!text) {
      triggerToast("Harap ketik atau paste draf tugas kamu terlebih dahulu! 🧸", false);
      return;
    }

    if (!activeProject) {
      triggerToast("Pilih atau buat proyek baru di sidebar terlebih dahulu! ⚠️", false);
      return;
    }

    const lines = text.split("\n");
    let parsedSections = [];
    let currentSection = null;
    const colors = ["pink", "yellow", "violet", "blue"];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      let isHeader = false;
      let cleanTitle = trimmed;

      // Pattern A: Ends with a colon
      if (trimmed.endsWith(":")) {
        isHeader = true;
        cleanTitle = trimmed.substring(0, trimmed.length - 1);
      }
      // Pattern B: Markdown Bold
      else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        isHeader = true;
        cleanTitle = trimmed.replace(/\*\*/g, "");
      }
      // Pattern C: Square Brackets
      else if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        isHeader = true;
        cleanTitle = trimmed.substring(1, trimmed.length - 1);
      }
      // Pattern D: Academic specific ratings/meta
      else if (trimmed.startsWith("**") && trimmed.includes(":")) {
        isHeader = true;
        const firstPart = trimmed.split(":")[0];
        cleanTitle = firstPart.replace(/\*\*/g, "");
      }

      if (isHeader) {
        cleanTitle = cleanTitle.trim();
        currentSection = {
          id: `sect_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          title: cleanTitle,
          color: colors[parsedSections.length % colors.length],
          tasks: []
        };
        parsedSections.push(currentSection);
      } else {
        // Fallback default section if none parsed yet
        if (!currentSection) {
          currentSection = {
            id: `sect_default_${Date.now()}`,
            title: "Draf Terurai ✨",
            color: "pink",
            tasks: []
          };
          parsedSections.push(currentSection);
        }

        let taskText = trimmed;

        // Clean bullets
        if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("+") || trimmed.startsWith("•")) {
          taskText = trimmed.substring(1).trim();
        } 
        // Clean numbers
        else {
          const numberPrefixRegex = /^(?:\[?\d+\]?|\[?[a-zA-Z]\]?)(?:\.|\))\s+/;
          if (numberPrefixRegex.test(trimmed)) {
            taskText = trimmed.replace(numberPrefixRegex, "").trim();
          }
        }

        // Academic review specific cleaner (skips ratings)
        const lowerText = taskText.toLowerCase();
        const isMetaInfo =
          lowerText.startsWith("recommendation:") ||
          lowerText.startsWith("acceptability:") ||
          (taskText.length < 5 && taskText.includes("(") && taskText.includes(")"));

        if (isMetaInfo) return;

        if (taskText) {
          currentSection.tasks.push({
            id: `task_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            text: taskText,
            checked: false
          });
        }
      }
    });

    // Remove empty sections
    parsedSections = parsedSections.filter(s => s.tasks.length > 0);

    if (parsedSections.length === 0) {
      triggerToast("Tidak dapat menemukan daftar tugas yang terstruktur. Pastikan draf memiliki baris daftar!", false);
      return;
    }

    // Update State
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== activeProjectId) return p;
        return {
          ...p,
          sections: [...p.sections, ...parsedSections]
        };
      })
    );

    setDraftText("");
    triggerToast(`Draf berhasil diurai menjadi ${parsedSections.length} section checklist! 💖✨`);

    // Scroll to checklist
    setTimeout(() => {
      document.querySelector(".todo-grid-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // 20. Load Sample Demo Draft
  const handleLoadDemo = () => {
    // Switch to a new or existing demo project
    const hasDemoProj = projects.find(p => p.name === "Peluncuran Game Pixel 🎮");
    if (hasDemoProj) {
      setActiveProjectId(hasDemoProj.id);
    } else {
      const demoProj = {
        id: `proj_demo_${Date.now()}`,
        name: "Peluncuran Game Pixel 🎮",
        icon: "🍒",
        sections: []
      };
      setProjects(prev => [...prev, demoProj]);
      setActiveProjectId(demoProj.id);
    }

    setDraftText(SAMPLE_JOURNAL_DRAFT);
    triggerToast("Draf Peluncuran Game berhasil dimuat! Tekan tombol pink untuk mengurai 🌸");
  };

  // 21. Copy AI Prompt for External LLM (Clipboard helper)
  const handleCopyPrompt = () => {
    let promptText = SYSTEM_PROMPT_TEMPLATE;
    const currentInput = draftText.trim();

    if (currentInput) {
      promptText = SYSTEM_PROMPT_TEMPLATE.replace("[TEMPEL DRAF KAMU DI SINI]", currentInput);
    } else {
      promptText = SYSTEM_PROMPT_TEMPLATE.replace("[TEMPEL DRAF KAMU DI SINI]", "... (tempel draf tulisan acakmu di sini) ...");
    }

    navigator.clipboard.writeText(promptText).then(() => {
      triggerToast("System Prompt disalin! Siap tempel di ChatGPT / Gemini 📋💖");
    }).catch(() => {
      triggerToast("Gagal menyalin otomatis. Harap salin manual ⚠️", false);
    });
  };

  // 22. Save New Project (Modal)
  const handleSaveNewProject = () => {
    const name = newProjectName.trim();
    if (!name) {
      alert("Harap masukkan nama proyek terlebih dahulu! 🎀");
      return;
    }

    const newProj = {
      id: `proj_${Date.now()}`,
      name,
      icon: selectedIcon,
      sections: []
    };

    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    setNewProjectName("");
    setIsModalOpen(false);
    triggerToast(`Proyek "${name}" berhasil dibuat! ✨`);
  };

  // 23. Local Storage Register & Login handlers (Offline Secure Authenticator)
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const email = authEmail.trim().toLowerCase();
    const password = authPassword;

    if (!email || !password) {
      alert("Harap isi seluruh formulir auth! 🧸");
      return;
    }

    // Load registered users list
    let registeredUsers = [];
    try {
      const savedUsers = localStorage.getItem("blocky_todo_users");
      if (savedUsers) registeredUsers = JSON.parse(savedUsers);
    } catch (err) {
      console.error(err);
    }

    if (authTab === "register") {
      // Validate confirm password (2 times password input)
      if (password !== authConfirmPassword) {
        alert("Konfirmasi Password salah! Password harus sama ⚠️");
        return;
      }

      if (password.length < 6) {
        alert("Password minimal harus 6 karakter! 🔒");
        return;
      }

      // Check if user already exists
      const userExists = registeredUsers.some(u => u.email === email);
      if (userExists) {
        alert("Email ini sudah terdaftar! Harap masuk saja 🌸");
        return;
      }

      // Create new user
      const newUser = { email, password };
      registeredUsers.push(newUser);
      localStorage.setItem("blocky_todo_users", JSON.stringify(registeredUsers));

      // Auto login new user
      localStorage.setItem("blocky_todo_auth_user", JSON.stringify({ email }));
      setAuthUser({ email });
      setProjects([]);
      setActiveProjectId(null);
      
      // Reset forms
      setAuthEmail("");
      setAuthPassword("");
      setAuthConfirmPassword("");

      // Trigger Onboarding Tour
      setIsOnboardingOpen(true);
      setOnboardingStep(0);
      triggerToast("Pendaftaran sukses! Selamat datang 🎀");
    } else {
      // Login validation
      const matchedUser = registeredUsers.find(u => u.email === email && u.password === password);
      if (!matchedUser) {
        alert("Email atau password salah! Harap cek kembali 🧸");
        return;
      }

      // Set logged-in session
      localStorage.setItem("blocky_todo_auth_user", JSON.stringify({ email }));
      setAuthUser({ email });

      // Load specific user project state
      const savedState = localStorage.getItem(`blocky_todo_next_state_${email}`);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed && parsed.projects) {
          setProjects(parsed.projects);
          setActiveProjectId(parsed.activeProjectId || (parsed.projects[0] ? parsed.projects[0].id : null));
        }
      } else {
        setProjects([]);
        setActiveProjectId(null);
      }

      // Reset forms
      setAuthEmail("");
      setAuthPassword("");

      // Check onboarding tour status
      const hasCompletedOnboarding = localStorage.getItem(`blocky_todo_onboarding_completed_${email}`);
      if (!hasCompletedOnboarding) {
        setIsOnboardingOpen(true);
        setOnboardingStep(0);
      }

      triggerToast("Masuk berhasil! Selamat beraktivitas 💖");
    }
  };

  // 24. Logout handler
  const handleLogout = () => {
    if (confirm("Apakah kamu yakin ingin keluar? 🚪")) {
      localStorage.removeItem("blocky_todo_auth_user");
      setAuthUser(null);
      setProjects([]);
      setActiveProjectId(null);
      triggerToast("Kamu berhasil keluar 🧸");
    }
  };

  // 25. Complete onboarding tour
  const handleCompleteOnboarding = () => {
    if (authUser) {
      localStorage.setItem(`blocky_todo_onboarding_completed_${authUser.email}`, "true");
    }
    setIsOnboardingOpen(false);
    triggerToast("Tur selesai! Selamat mencoba Blocky Todo! 🎀👾");
  };

  // XP & Task calculations
  let totalTasks = 0;
  let completedTasks = 0;
  if (activeProject) {
    activeProject.sections.forEach(sect => {
      totalTasks += sect.tasks.length;
      completedTasks += sect.tasks.filter(t => t.checked).length;
    });
  }
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Hydration fallback
  if (!mounted) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFDF9", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center", color: "#4A2E35" }}>
          <span style={{ fontSize: "64px", display: "block", animation: "wiggle 2s infinite" }}>🎀</span>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginTop: "12px" }}>Memuat Blocky Todo...</h2>
        </div>
      </div>
    );
  }

  // 26. Render Login / Register View if not logged-in
  if (!authUser) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Blocky Todo 🎀</h2>
            <p>cute ✦ offline-first ✦ AI parser</p>
          </div>
          
          <div className="auth-tabs">
            <button
              className={`auth-tab ${authTab === "login" ? "active" : ""}`}
              onClick={() => setAuthTab("login")}
            >
              Masuk 🔑
            </button>
            <button
              className={`auth-tab ${authTab === "register" ? "active" : ""}`}
              onClick={() => setAuthTab("register")}
            >
              Daftar Baru 🎀
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-body">
            <div className="auth-form-group">
              <label htmlFor="auth-email">Alamat Email:</label>
              <input
                id="auth-email"
                type="email"
                required
                className="chunky-input"
                placeholder="misal: sakura@coquette.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="auth-password">Kata Sandi (Password):</label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                className="chunky-input"
                placeholder="••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </div>

            {authTab === "register" && (
              <div className="auth-form-group" style={{ animation: "fadeIn 0.2s" }}>
                <label htmlFor="auth-confirm">Konfirmasi Kata Sandi (Masuk 2 Kali):</label>
                <input
                  id="auth-confirm"
                  type="password"
                  required
                  className="chunky-input"
                  placeholder="masukkan password sekali lagi..."
                  value={authConfirmPassword}
                  onChange={(e) => setAuthConfirmPassword(e.target.value)}
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-chunky" style={{ marginTop: "12px" }}>
              {authTab === "login" ? "Masuk ✨" : "Daftar ✨"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 27. Onboarding Tutorial Slides definition
  const onboardingSlides = [
    {
      icon: "🎀",
      title: "Selamat datang di Blocky Todo! 👾",
      desc: "Petualangan checklist super imut bermotif Pink Coquette dan retro Block Game dimulai di sini! Mari kita kenali fitur-fitur keren yang siap membantumu merapikan catatan harian."
    },
    {
      icon: "📂",
      title: "Memahami Proyek & Section 🗂️",
      desc: "Proyek adalah wadah besar (folder) untuk mengelompokkan kegiatanmu (misal: Kuliah, Kerja, Belanja). Di dalam Proyek terdapat Section (Kategori) untuk mengelompokkan tugas agar tidak menumpuk menjadi satu list yang memusingkan!"
    },
    {
      icon: "💖",
      title: "Hati & Chiptune Sound 🎶",
      desc: "Tugas divisualisasikan dengan checkbox hati kosong '♡'. Klik hati tersebut untuk menyelesaikannya! Tugas akan berubah menjadi hati pink '💖' disertai dengan letusan partikel bintang bersinar dan efek suara ding retro yang manis!"
    },
    {
      icon: "✍️",
      title: "Smart Local Parser (Zero-API) ✨",
      desc: "Tulis atau paste draf panjang acakmu (tanpa batasan kata) di kotak textarea. Cukup pisahkan dengan judul berakhiran titik dua (misal: Reviewer A:) lalu bullet (-), parser kami akan otomatis membaginya menjadi section-section checklist instan!"
    }
  ];

  return (
    <>
      {/* Floating Sparkle layer */}
      <div id="sparkle-layer">
        {sparkles.map(p => (
          <span
            key={p.id}
            className="sparkle-particle"
            style={{
              left: p.x,
              top: p.y,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      <div className="app-container">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo-box">
              <span className="logo-icon">🎀</span>
              <div className="logo-text">
                <h1>Blocky Todo</h1>
                <p className="tagline">cute ✦ AI ✦ blocky</p>
              </div>
            </div>
          </div>

          {/* User profile details with logout */}
          <div className="user-profile-badge">
            <div className="user-profile-info">
              <div style={{ fontSize: "11px", fontWeight: "bold" }}>👤 Akun Aktif:</div>
              <div className="user-profile-email" title={authUser.email}>{authUser.email}</div>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Keluar Akun">
              🚪
            </button>
          </div>

          <div className="sidebar-content">
            <div className="section-title-box">
              <span className="pixel-star">⭐</span>
              <h2>PROYEK SAYA</h2>
            </div>

            {projects.length === 0 ? (
              <div style={{ fontSize: "12px", opacity: 0.6, fontStyle: "italic", padding: "8px", textAlign: "center" }}>
                Belum ada proyek... 🧸
              </div>
            ) : (
              <ul className="project-list">
                {projects.map(project => {
                  const isActive = project.id === activeProjectId;
                  let projTotal = 0;
                  let projChecked = 0;
                  project.sections.forEach(s => {
                    projTotal += s.tasks.length;
                    projChecked += s.tasks.filter(t => t.checked).length;
                  });
                  const projPct = projTotal > 0 ? Math.round((projChecked / projTotal) * 100) : 0;
                  const isDropdownOpen = activeDropdownProjectId === project.id;

                  return (
                    <li
                      key={project.id}
                      className={`project-item ${isActive ? "active" : ""}`}
                      onClick={() => setActiveProjectId(project.id)}
                    >
                      <div className="project-item-left">
                        <span className="project-icon-display">{project.icon}</span>
                        <span className="project-title" title={project.name}>{project.name}</span>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                        <span className="project-progress-dot">{projPct}%</span>
                        
                        {/* Three-Dots Menu Dropdown */}
                        <div className="project-dropdown-container">
                          <button
                            className="btn-project-more"
                            onClick={() => setActiveDropdownProjectId(isDropdownOpen ? null : project.id)}
                            title="Pilihan Proyek"
                          >
                            ⋮
                          </button>

                          {isDropdownOpen && (
                            <div className="project-dropdown-menu">
                              <button
                                className="project-dropdown-item"
                                onClick={() => {
                                  setActiveDropdownProjectId(null);
                                  handleRenameProjectModalOpen(project.id);
                                }}
                              >
                                ✏️ Edit Nama
                              </button>
                              <button
                                className="project-dropdown-item danger"
                                onClick={() => {
                                  setActiveDropdownProjectId(null);
                                  handleDeleteProject(project.id);
                                }}
                              >
                                ❌ Hapus Proyek
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              className="btn btn-add-project"
              onClick={() => {
                setNewProjectName("");
                setSelectedIcon("🍓");
                setIsModalOpen(true);
              }}
            >
              <span className="btn-icon">➕</span> Proyek Baru
            </button>
          </div>

          <div className="sidebar-footer">
            <div className="coquette-decor">🍓 💖 🧸 🌸</div>
            <p className="copyright" style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => { setIsOnboardingOpen(true); setOnboardingStep(0); }}>
              Buka Petunjuk Tur 🎀
            </p>
          </div>
        </aside>

        {/* MAIN WORKSPACE */}
        <main className="main-workspace">
          {/* If there are NO projects, show the highly explanatory Welcome empty state card! */}
          {projects.length === 0 ? (
            <section className="welcome-card">
              <h2>Yuk Mulai Petualangan Checklist-mu! 🎀</h2>
              <p className="welcome-subtitle">
                Aplikasi <strong>Blocky Todo</strong> menggunakan struktur terorganisir 3 lapis untuk membantumu merapikan semua draf catatan acak. Berikut adalah penjelasannya agar kamu langsung paham:
              </p>

              <div className="welcome-grid">
                <div className="welcome-item">
                  <span className="welcome-item-icon">📂</span>
                  <h4>1. Proyek (Projects)</h4>
                  <p>Folder induk kegiatanmu. Satu proyek menampung kelompok tugas sejenis (misal: Kerja Toko, Skripsi).</p>
                </div>
                <div className="welcome-item">
                  <span className="welcome-item-icon">🗂️</span>
                  <h4>2. Section (Kategori)</h4>
                  <p>Pembagi kartu di dalam proyek agar tugas tidak menumpuk jadi satu daftar panjang yang memusingkan!</p>
                </div>
                <div className="welcome-item">
                  <span className="welcome-item-icon">💖</span>
                  <h4>3. To-Do (Daftar Tugas)</h4>
                  <p>Butir tugas aksi nyata. Setiap selesai dicentang, letusan sparkle imut dan sound retro 8-bit akan terputar!</p>
                </div>
              </div>

              <button
                className="btn btn-primary btn-chunky"
                onClick={() => {
                  setNewProjectName("");
                  setSelectedIcon("🍓");
                  setIsModalOpen(true);
                }}
              >
                🚀 Buat Proyek Pertamamu!
              </button>
            </section>
          ) : (
            <>
              {/* HEADER / XP BAR */}
              <header className="workspace-header">
                <div className="project-info">
                  <span className="current-icon">{activeProject ? activeProject.icon : "🌸"}</span>
                  <h2 id="current-project-title">
                    {activeProject ? activeProject.name : "Pilih Proyek"}
                  </h2>
                </div>

                <div className="progress-xp-container">
                  <div className="progress-xp-info">
                    <span className="progress-text">📋 {completedTasks} / {totalTasks} selesai</span>
                    <span className="progress-percent">{completionPercent}%</span>
                  </div>
                  <div className="xp-bar-outer">
                    <div
                      className="xp-bar-inner"
                      style={{
                        width: `${completionPercent}%`,
                        backgroundColor: completionPercent === 100 && totalTasks > 0 ? "var(--pink-dark)" : "var(--mint-primary)",
                        boxShadow: completionPercent === 100 && totalTasks > 0 ? "inset -4px 0px 0px var(--pink-deep)" : "inset -4px 0px 0px var(--mint-dark)"
                      }}
                    >
                      <div className="xp-bar-decor">
                        {completionPercent === 100 && totalTasks > 0 ? "💖" : "🎀"}
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              {/* WORKSPACE CONTENT */}
              <div className="workspace-content" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {/* DRAFT PARSER CARD */}
                <section className="card draft-card">
                  <div className="card-header">
                    <span className="card-header-icon">✍️</span>
                    <h3>Tulis draf, AI & Parser yang rapikan ✨</h3>
                  </div>

                  <div className="card-body">
                    <p className="card-tip">
                      <strong>Tip Format Pintar (Zero-API):</strong> Ketik draf atau paste daftar tugas kamu di bawah. Tulis nama section diakhiri titik dua (contoh: <code>Tugas Mendesak:</code> atau <code>**Proyek Utama**</code>) lalu awali tugas dengan bullet (<code>-</code> atau penomoran) agar otomatis terbagi menjadi section checklist secara instan!
                    </p>

                    <div className="textarea-container">
                      <textarea
                        id="draft-input"
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        placeholder="tempel atau ketik draf tugas sepanjang apa pun di sini (Tanpa Batasan Kata!)..."
                      />
                      <div className="char-counter">{draftText.length} karakter</div>
                    </div>

                    <div className="action-row">
                      <button className="btn btn-primary btn-chunky" onClick={handleParseDraft}>
                        <span className="btn-icon">✨</span> Ubah jadi To-Do
                      </button>
                      <button className="btn btn-secondary btn-chunky" onClick={handleLoadDemo}>
                        <span className="btn-icon">💡</span> Coba Draf Jurnal (Demo)
                      </button>
                    </div>
                  </div>

                  {/* HELPER CARD FOR EXTERNAL LLM */}
                  <div className="prompt-helper-card">
                    <div className="prompt-helper-text">
                      <h4>Catatanmu berantakan sekali? 🎀</h4>
                      <p>Salin <strong>System Prompt AI</strong> ini untuk ditempel di ChatGPT/Gemini Web. AI luar akan otomatis merapikan draf acakmu agar siap di-paste di sini secara sempurna!</p>
                    </div>
                    <button className="btn btn-mini btn-copy-prompt" onClick={handleCopyPrompt}>
                      📋 Salin Prompt AI
                    </button>
                  </div>
                </section>

                {/* TODO GRID */}
                <section className="todo-grid-section">
                  <div className="section-actions">
                    <h3 className="sections-title">Sections & To-do</h3>
                    <button className="btn btn-secondary btn-mini" onClick={handleAddSection}>
                      ➕ Section Baru
                    </button>
                  </div>

                  {activeProject ? (
                    activeProject.sections.length === 0 ? (
                      <div className="empty-state" style={{ textAlign: "center", padding: "48px", border: "var(--border-width) dashed var(--pink-primary)", borderRadius: "16px", background: "#fff" }}>
                        <span style={{ fontSize: "48px", display: "block", marginBottom: "12px", animation: "pulse 1.5s infinite" }}>🧁</span>
                        <h4 style={{ fontFamily: "var(--font-cute)", fontSize: "18px", marginBottom: "8px" }}>Proyek ini masih kosong</h4>
                        <p style={{ fontSize: "13px", opacity: 0.7, marginBottom: "16px" }}>Tulis draf tugasmu di kotak teks atas, atau tambahkan section secara manual!</p>
                        <button className="btn btn-secondary btn-mini" onClick={handleAddSection}>➕ Tambah Section Baru</button>
                      </div>
                    ) : (
                      <div className="sections-container">
                        {activeProject.sections.map((sect, sIndex) => {
                          const colors = ["pink", "yellow", "violet", "blue"];
                          const colorClass = sect.color || colors[sIndex % colors.length];

                          return (
                            <div key={sect.id} className={`section-card color-${colorClass}`}>
                              {/* Card Header */}
                              <div className="section-card-header">
                                <div className="section-card-title-container">
                                  {editingSectionId === sect.id ? (
                                    <input
                                      type="text"
                                      className="section-header-input"
                                      value={editingSectionTitle}
                                      onChange={(e) => setEditingSectionTitle(e.target.value)}
                                      onBlur={() => handleSaveSectionRename(sect.id)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveSectionRename(sect.id);
                                        if (e.key === "Escape") setEditingSectionId(null);
                                      }}
                                      autoFocus
                                    />
                                  ) : (
                                    <h4
                                      className="section-title-text"
                                      onDoubleClick={() => {
                                        setEditingSectionId(sect.id);
                                        setEditingSectionTitle(sect.title);
                                      }}
                                    >
                                      {sect.title}
                                    </h4>
                                  )}
                                </div>
                                <div className="section-header-actions">
                                  <button
                                    className="btn-header-action"
                                    onClick={() => {
                                      setEditingSectionId(sect.id);
                                      setEditingSectionTitle(sect.title);
                                    }}
                                    title="Rename Section"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="btn-header-action"
                                    onClick={() => handleDeleteSection(sect.id)}
                                    title="Hapus Section"
                                  >
                                    ✖
                                  </button>
                                </div>
                              </div>

                              {/* Card Body */}
                              <div className="section-card-body">
                                {sect.tasks.length === 0 ? (
                                  <div style={{ textAlign: "center", padding: "16px 8px", opacity: 0.6, fontSize: "12px", fontStyle: "italic" }}>
                                    Belum ada tugas di section ini... ✨
                                  </div>
                                ) : (
                                  sect.tasks.map(task => (
                                    <div key={task.id} className={`todo-item ${task.checked ? "checked" : ""}`}>
                                      <div className="todo-checkbox-wrapper">
                                        <input
                                          type="checkbox"
                                          className="todo-checkbox"
                                          checked={task.checked}
                                          onChange={(e) => handleToggleTask(sect.id, task.id, e.target.checked, e)}
                                        />
                                      </div>

                                      <div className="todo-text-container">
                                        {editingTaskId === task.id ? (
                                          <input
                                            type="text"
                                            className="todo-edit-input"
                                            value={editingTaskText}
                                            onChange={(e) => setEditingTaskText(e.target.value)}
                                            onBlur={() => handleSaveTaskEdit(sect.id, task.id)}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") handleSaveTaskEdit(sect.id, task.id);
                                              if (e.key === "Escape") setEditingTaskId(null);
                                            }}
                                            autoFocus
                                          />
                                        ) : (
                                          <span
                                            className="todo-text"
                                            onDoubleClick={() => {
                                              setEditingTaskId(task.id);
                                              setEditingTaskText(task.text);
                                            }}
                                          >
                                            {task.text}
                                          </span>
                                        )}
                                      </div>

                                      <div className="todo-actions">
                                        <button
                                          className="btn-todo-action"
                                          onClick={() => {
                                            setEditingTaskId(task.id);
                                            setEditingTaskText(task.text);
                                          }}
                                          title="Edit Tugas"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          className="btn-todo-action"
                                          onClick={() => handleDeleteTask(sect.id, task.id)}
                                          title="Hapus Tugas"
                                        >
                                          ✖
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Card Footer / Add Task */}
                              <div className="add-task-container">
                                <form className="add-task-form" onSubmit={(e) => handleAddTaskSubmit(e, sect.id)}>
                                  <input
                                    type="text"
                                    className="task-input"
                                    placeholder="Tambah tugas baru..."
                                    required
                                  />
                                  <button type="submit" className="btn btn-add-task">
                                    ➕
                                  </button>
                                </form>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    <div className="empty-state" style={{ textAlign: "center", padding: "48px", border: "var(--border-width) dashed var(--pink-primary)", borderRadius: "16px", background: "#fff" }}>
                      <span style={{ fontSize: "48px", display: "block", marginBottom: "12px", animation: "wiggle 2s infinite" }}>🧸</span>
                      <h4 style={{ fontFamily: "var(--font-cute)", fontSize: "18px", marginBottom: "8px" }}>Belum ada proyek terpilih!</h4>
                      <p style={{ fontSize: "13px", opacity: 0.7 }}>Buat proyek baru di sidebar kiri untuk memulai perjalanan checklist barumu 🎀</p>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </main>
      </div>

      {/* NEW PROJECT MODAL */}
      <div className={`modal-overlay ${isModalOpen ? "active" : ""}`}>
        <div className="modal-box">
          <div className="modal-header">
            <h3>🎀 Buat Proyek Baru 🎀</h3>
            <button className="btn-close" onClick={() => setIsModalOpen(false)}>✖️</button>
          </div>
          <div className="modal-body">
            <label htmlFor="new-project-name">Nama Proyek:</label>
            <input
              type="text"
              id="new-project-name"
              placeholder="Misal: Catatan Belajar Svelte..."
              className="chunky-input"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveNewProject();
              }}
            />

            <label htmlFor="new-project-icon">Pilih Icon Lucu:</label>
            <div className="icon-selector">
              {["🍓", "💖", "🧸", "🎀", "🍒", "🌸", "🧁", "🎮"].map(icon => (
                <span
                  key={icon}
                  className={`icon-option ${selectedIcon === icon ? "selected" : ""}`}
                  onClick={() => setSelectedIcon(icon)}
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSaveNewProject}>Buat ✨</button>
          </div>
        </div>
      </div>

      {/* RENAME PROJECT MODAL (Reuses modal overlay class for perfect styling) */}
      <div className={`modal-overlay ${isRenameModalOpen ? "active" : ""}`}>
        <div className="modal-box">
          <div className="modal-header">
            <h3>✏️ Ubah Nama Proyek ✏️</h3>
            <button className="btn-close" onClick={() => setIsRenameModalOpen(false)}>✖️</button>
          </div>
          <div className="modal-body">
            <label htmlFor="rename-project-name">Nama Baru Proyek:</label>
            <input
              type="text"
              id="rename-project-name"
              className="chunky-input"
              value={renameProjectName}
              onChange={(e) => setRenameProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveProjectRename();
              }}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setIsRenameModalOpen(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSaveProjectRename}>Simpan ✨</button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE ONBOARDING TUTORIAL MODAL */}
      {isOnboardingOpen && (
        <div className="onboarding-overlay">
          <div className="onboarding-box">
            <div className="onboarding-header">
              <h3>🎀 Panduan Blocky Todo 🎀</h3>
            </div>
            
            <div className="onboarding-body">
              <div className="onboarding-slide">
                <span className="onboarding-icon">
                  {onboardingSlides[onboardingStep].icon}
                </span>
                <h4>{onboardingSlides[onboardingStep].title}</h4>
                <p>{onboardingSlides[onboardingStep].desc}</p>

                {onboardingStep === 1 && (
                  <div className="onboarding-explain-box">
                    <div className="onboarding-explain-item">
                      📂 <strong>Proyek:</strong> Kontainer utama (misal: "Beli Kado Wisuda").
                    </div>
                    <div className="onboarding-explain-item">
                      🗂️ <strong>Section:</strong> Kategori pemisah (misal: "Reviewer A", "Toko Online").
                    </div>
                  </div>
                )}
                
                {onboardingStep === 2 && (
                  <div className="onboarding-explain-box" style={{ textAlign: "center" }}>
                    Centang checklist hati <code>♡</code> agar meletus menjadi <code>💖</code> dengan suara retro coin yang manis!
                  </div>
                )}
              </div>
            </div>

            <div className="onboarding-footer">
              {/* Pagination Dots */}
              <div className="onboarding-dots">
                {onboardingSlides.map((_, idx) => (
                  <span
                    key={idx}
                    className={`onboarding-dot ${onboardingStep === idx ? "active" : ""}`}
                    onClick={() => setOnboardingStep(idx)}
                  />
                ))}
              </div>

              {/* Navigation Action Buttons */}
              <div style={{ display: "flex", gap: "8px" }}>
                {onboardingStep > 0 && (
                  <button
                    className="btn btn-secondary btn-mini"
                    onClick={() => setOnboardingStep(prev => prev - 1)}
                  >
                    ⬅️ Mundur
                  </button>
                )}
                {onboardingStep < onboardingSlides.length - 1 ? (
                  <button
                    className="btn btn-primary btn-mini"
                    onClick={() => setOnboardingStep(prev => prev + 1)}
                  >
                    Lanjut ➡️
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-mini"
                    onClick={handleCompleteOnboarding}
                  >
                    Selesai ✨
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div
        className={`toast ${isToastVisible ? "show" : ""}`}
        style={{ display: isToastVisible ? "block" : "none" }}
      >
        {isToastSuccess ? "💖" : "⚠️"} {toastMessage}
      </div>
    </>
  );
}
