export function toggleSidebar() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle(styles.active); // Sử dụng styles.active
  });
}
