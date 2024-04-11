export default function (pathname : string) {
    return pathname.replace("/files/", "").split("/")
}