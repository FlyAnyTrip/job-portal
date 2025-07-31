"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import {
  ExternalLink,
  Eye,
  AlertCircle,
  RefreshCw,
  Copy,
  CheckCircle,
  Server,
  Wrench,
  X,
  Maximize2,
} from "lucide-react"
import { toast } from "sonner"
import { USER_API_END_POINT } from "@/utils/constant"
import axios from "axios"

const PDFViewer = ({ pdfUrl, fileName, onPDFFixed }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [pdfStatus, setPdfStatus] = useState("checking")
  const [copied, setCopied] = useState(false)
  const [proxyUrl, setProxyUrl] = useState("")
  const [isFixing, setIsFixing] = useState(false)
  const [showEmbeddedViewer, setShowEmbeddedViewer] = useState(false)
  const [currentViewerUrl, setCurrentViewerUrl] = useState("")

  useEffect(() => {
    checkPDFAccess()
    generateProxyUrl()
  }, [pdfUrl])

  const generateProxyUrl = () => {
    if (pdfUrl) {
      const proxy = `${USER_API_END_POINT}/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`
      setProxyUrl(proxy)
      console.log("Generated proxy URL:", proxy)
    }
  }

  const checkPDFAccess = async () => {
    try {
      console.log("🔍 Checking PDF access:", pdfUrl)
      setPdfStatus("checking")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        const response = await fetch(pdfUrl, {
          method: "HEAD",
          signal: controller.signal,
          mode: "no-cors",
        })
        clearTimeout(timeoutId)
        setPdfStatus("accessible")
        console.log("✅ PDF is accessible")
      } catch (fetchError) {
        clearTimeout(timeoutId)
        console.log("❌ PDF access blocked, will use fallbacks")
        setPdfStatus("blocked")
      }
    } catch (error) {
      setPdfStatus("blocked")
      console.log("❌ PDF access error:", error)
    }
  }

  const handleFixPDFAccess = async () => {
    try {
      setIsFixing(true)
      console.log("🔧 Attempting to fix PDF access...")

      const response = await axios.post(
        `${USER_API_END_POINT}/fix-pdf-access`,
        {},
        {
          withCredentials: true,
        },
      )

      if (response.data.success) {
        toast.success("")
        setPdfStatus("fixed")

        if (onPDFFixed) {
          onPDFFixed(response.data.newUrl)
        }

        setTimeout(() => {
          checkPDFAccess()
        }, 2000)
      }
    } catch (error) {
      console.error("❌ Failed to fix PDF access:", error)
      toast.error("Failed to fix PDF access. Please re-upload your resume.")
    } finally {
      setIsFixing(false)
    }
  }

  // 🚀 MAIN VIEW PDF - Uses PDF.js by default
  const handleViewPDF = async () => {
    try {
      setIsLoading(true)
      console.log("🔍 Opening PDF.js viewer (default)")

      const urlToUse = pdfStatus === "blocked" ? proxyUrl : pdfUrl
      const pdfJsUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(urlToUse)}`

      setCurrentViewerUrl(pdfJsUrl)
      setShowEmbeddedViewer(true)

      toast.success("✅ PDF viewer opened!")
    } catch (error) {
      console.error("❌ PDF.js view failed:", error)
      toast.error("PDF.js failed, trying Google Docs...")
      handleGoogleDocsView()
    } finally {
      setIsLoading(false)
    }
  }

  const handlePDFJSView = async () => {
    try {
      setIsLoading(true)
      console.log("🔍 Opening PDF.js embedded viewer")

      const urlToUse = pdfStatus === "blocked" ? proxyUrl : pdfUrl
      const pdfJsUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(urlToUse)}`

      setCurrentViewerUrl(pdfJsUrl)
      setShowEmbeddedViewer(true)

      toast.success("✅ PDF.js viewer opened!")
    } catch (error) {
      console.error("❌ PDF.js view failed:", error)
      toast.error("PDF.js failed, trying Google Docs...")
      handleGoogleDocsView()
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleDocsView = async () => {
    try {
      setIsLoading(true)
      console.log("🔍 Opening Google Docs embedded viewer")

      const urlToUse = pdfStatus === "blocked" ? proxyUrl : pdfUrl
      const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(urlToUse)}&embedded=true`

      setCurrentViewerUrl(googleDocsUrl)
      setShowEmbeddedViewer(true)

      toast.success("✅ Google Docs viewer opened!")
    } catch (error) {
      console.error("❌ Google Docs view failed:", error)
      toast.error("All viewers failed. Please try copying URL.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProxyView = async () => {
    try {
      setIsLoading(true)
      console.log("🔍 Opening backend proxy viewer")

      setCurrentViewerUrl(proxyUrl)
      setShowEmbeddedViewer(true)

      toast.success("✅ Backend proxy viewer opened!")
    } catch (error) {
      console.error("❌ Proxy view failed:", error)
      toast.error("Proxy failed, trying PDF.js...")
      handlePDFJSView()
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenInNewTab = () => {
    try {
      const urlToUse = pdfStatus === "blocked" ? proxyUrl : pdfUrl
      const pdfJsUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(urlToUse)}`
      window.open(pdfJsUrl, "_blank", "noopener,noreferrer")
      toast.success("✅ PDF opened in new tab!")
    } catch (error) {
      console.error("❌ Failed to open in new tab:", error)
      toast.error("Failed to open in new tab")
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(pdfUrl)
      setCopied(true)
      toast.success("📋 PDF URL copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("❌ Copy failed:", error)
      try {
        const textArea = document.createElement("textarea")
        textArea.value = pdfUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        setCopied(true)
        toast.success("📋 PDF URL copied!")
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackError) {
        toast.error("Failed to copy URL")
      }
    }
  }

  const getStatusColor = () => {
    switch (pdfStatus) {
      case "accessible":
        return "green"
      case "blocked":
        return "red"
      case "fixed":
        return "blue"
      case "checking":
        return "yellow"
      default:
        return "gray"
    }
  }

  const getStatusText = () => {
    switch (pdfStatus) {
      case "accessible":
        return "✅ Direct Access"
      case "blocked":
        return "❌ Access Blocked"
      case "fixed":
        return "🔧 Access Fixed"
      case "checking":
        return "🔍 Checking..."
      default:
        return "❓ Unknown"
    }
  }

  return (
    <div className="space-y-4">
      {/* PDF Status Indicator */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-${getStatusColor()}-500 rounded-lg flex items-center justify-center`}>
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{fileName || "Resume.pdf"}</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500">PDF Document</p>
              <span
                className={`text-xs bg-${getStatusColor()}-100 text-${getStatusColor()}-800 px-2 py-1 rounded-full`}
              >
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fix Access Button */}
      {pdfStatus === "blocked" && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-yellow-800">PDF Access Issue Detected</p>
              <p className="text-sm text-yellow-600">Try fixing the access permissions automatically</p>
            </div>
            <Button
              onClick={handleFixPDFAccess}
              disabled={isFixing}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isFixing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
              {isFixing ? "Fixing..." : "Fix Access"}
            </Button>
          </div>
        </div>
      )}

      {/* 🚀 MAIN VIEW BUTTON - PDF.js ONLY */}
      <div className="w-full">
        <Button
          onClick={handleViewPDF}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 py-3"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
          View PDF
        </Button>
      </div>

      {/* ALTERNATIVE VIEWERS */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleGoogleDocsView}
          disabled={isLoading}
          variant="outline"
          className="border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors duration-200 bg-transparent"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Google Docs
        </Button>

        <Button
          onClick={handleProxyView}
          disabled={isLoading}
          variant="outline"
          className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 transition-colors duration-200 bg-transparent"
        >
          <Server className="w-4 h-4 mr-2" />
          Backend Proxy
        </Button>

        <Button
          onClick={handleOpenInNewTab}
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors duration-200 bg-transparent"
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          New Tab
        </Button>

        <Button
          onClick={handleCopyUrl}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 bg-transparent"
        >
          {copied ? <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copied!" : "Copy URL"}
        </Button>
      </div>

      {/* 🚀 EMBEDDED PDF VIEWER - PDF.js IFRAME */}
      {showEmbeddedViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">PDF Viewer - {fileName}</h3>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleOpenInNewTab}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  <Maximize2 className="w-4 h-4 mr-1" />
                  Open in New Tab
                </Button>
                <Button
                  onClick={() => setShowEmbeddedViewer(false)}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* PDF Content */}
            <div className="flex-1 p-4">
              <iframe
                src={currentViewerUrl}
                className="w-full h-full border border-gray-300 rounded-lg"
                title="PDF Viewer"
                onLoad={() => {
                  console.log("✅ PDF loaded successfully in iframe")
                  toast.success("PDF loaded successfully!")
                }}
                onError={() => {
                  console.log("❌ PDF failed to load in iframe")
                  toast.error("PDF failed to load. Try a different viewer.")
                }}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-center">
                <p className="text-sm text-gray-600">💡 Using PDF.js viewer for best compatibility</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section
      <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-2">📄 PDF Viewing Options:</p>
            <div className="space-y-1">
              <p>
                🔹 <strong>View PDF:</strong> Opens PDF.js viewer (recommended)
              </p>
              <p>
                🔹 <strong>Google Docs:</strong> Alternative viewer
              </p>
              <p>
                🔹 <strong>Backend Proxy:</strong> Server-side viewer
              </p>
              <p>
                🔹 <strong>New Tab:</strong> PDF.js in new tab
              </p>
              <p>
                🔹 <strong>Copy URL:</strong> Copy direct PDF link
              </p>
            </div>
            <p className="mt-2 text-green-600 font-medium">✅ View-only mode - no downloads!</p>
          </div>
        </div>
      </div> */}
    </div>
  )
}

export default PDFViewer
