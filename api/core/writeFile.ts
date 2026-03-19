type Error = unknown

// Deno.writeFileSync('hello2.txt', data, { create: false }) // only works if "hello2.txt" exists

// Deno.writeFileSync('hello3.txt', data, { mode: 0o777 }) // set permissions on new file

// Deno.writeFileSync('hello4.txt', data, { append: true }) // add data to the end of the file
function writeFile(path: string, data: Uint8Array): Error {
  try {
    Deno.writeFileSync(path, data)
  } catch (err) {
    return err
  }
  return null
}

export { writeFile }
