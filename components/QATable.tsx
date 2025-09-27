import React from 'react';
import type { QAItem } from '../types';

interface QATableProps {
  data: QAItem[];
}

const QATable: React.FC<QATableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto bg-transparent border border-slate-700 rounded-lg">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-700/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-1/12">
              Step
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-5/12">
              Question
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-6/12">
              Answer
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {data.map((item) => (
            <tr key={item.step} className="hover:bg-slate-700/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">
                {item.step}
              </td>
              <td className="px-6 py-4 text-sm text-slate-300">{item.question}</td>
              <td className="px-6 py-4 text-sm text-slate-300">{item.answer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QATable;