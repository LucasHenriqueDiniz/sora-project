fn main() {
    // Set OUT_DIR for build script
    println!(
        "cargo:rustc-env=OUT_DIR={}",
        std::env::var("OUT_DIR").unwrap()
    );
    tauri_build::build()
}
