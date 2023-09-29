import { createPatch } from 'diff';
import * as Diff2Html from 'diff2html';

export const htmlOrder = [
  'rel',
  'type',
  'href',
  'src',
  'width',
  'height',
  'target',
  'id',
  'name',
  'class',
  'style',
  'title',
  'alt',
  'placeholder',
  'role',
  'aria-.+',
  'data-.+',
  '$unknown$',
];

export const codeDiff = (originCode: string, lintCode: string) => {
  let html = '';
  const diffText = createPatch('', originCode, lintCode, '', '');
  if (diffText.length > 88) {
    html = Diff2Html.html(diffText, {
      drawFileList: false,
      matching: 'lines',
      outputFormat: 'side-by-side',
    });
  }
  html = html.replace(
    '<span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>',
    '<span class="d2h-tag d2h-changed d2h-changed-tag">비교</span></span>',
  );
  return html;
};
