import * as fc from "fast-check";

// Konfigurasi global fast-check
// Minimum 100 iterasi per property test sesuai design.md
fc.configureGlobal({
  numRuns: 100,
  verbose: true, // tampilkan counterexample saat gagal
});
