/**
 * Utility file for importing PDF-related dependencies
 * This file provides proper import patterns for the PDF generation libraries
 */

// jsPDF import - ES6 import for better TypeScript support
import jsPDFLib from 'jspdf'
export const jsPDF = jsPDFLib

// html2canvas import - ES6 import for better TypeScript support
import html2canvasLib from 'html2canvas'
export const html2canvas = html2canvasLib

// file-saver - ES6 import works fine
export { saveAs } from 'file-saver'

// uuid - ES6 import works fine
export { v4 as uuidv4 } from 'uuid'

// Type definitions for better TypeScript support
export interface PDFDocument {
  addPage(): void
  text(text: string, x: number, y: number): void
  save(filename: string): void
  output(type: string): string | Blob
}

export interface Html2CanvasOptions {
  allowTaint?: boolean
  backgroundColor?: string
  canvas?: HTMLCanvasElement
  foreignObjectRendering?: boolean
  imageTimeout?: number
  ignoreElements?: (element: Element) => boolean
  logging?: boolean
  onclone?: (clonedDoc: Document, element: HTMLElement) => void
  proxy?: string
  removeContainer?: boolean
  scale?: number
  useCORS?: boolean
  width?: number
  height?: number
}