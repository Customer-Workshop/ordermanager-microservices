import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { getGanttData, updateAssignment } from '../api';

function GanttChart({ territoryId, marketIds, date }) {
  const ganttContainer = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const initialized = useRef(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (!ganttContainer.current) return;

    if (!initialized.current) {
      // Configure gantt
      gantt.config.date_format = '%Y-%m-%d %H:%i';
      gantt.config.scale_unit = 'hour';
      gantt.config.date_scale = '%H:%i';
      gantt.config.step = 1;
      gantt.config.min_column_width = 60;
      gantt.config.scale_height = 60;
      gantt.config.row_height = 40;
      gantt.config.bar_height = 28;
      gantt.config.fit_tasks = true;
      gantt.config.auto_scheduling = false;
      gantt.config.drag_resize = true;
      gantt.config.drag_move = true;
      gantt.config.drag_progress = false;
      gantt.config.drag_links = false;
      gantt.config.details_on_dblclick = false;
      gantt.config.grid_width = 260;
      gantt.config.open_tree_initially = true;
      gantt.config.show_links = false;
      gantt.config.readonly = false;

      // Subscales for finer time display
      gantt.config.subscales = [
        { unit: 'minute', step: 15, date: '%i' }
      ];

      // Columns definition for left panel
      gantt.config.columns = [
        { name: 'text', label: 'Technician / Task', tree: true, width: 240, resize: true }
      ];

      // Custom task text
      gantt.templates.task_text = function(start, end, task) {
        if (task.taskType === 'TECHNICIAN') return '';
        return task.text || '';
      };

      // Color tasks by type
      gantt.templates.task_class = function(start, end, task) {
        if (task.taskType === 'TRAVEL' || task.taskType === 'RETURN_HOME') return 'gantt-travel';
        if (task.taskType === 'BREAK') return 'gantt-break';
        return '';
      };

      // Tooltip
      gantt.templates.tooltip_text = function(start, end, task) {
        if (task.taskType === 'TECHNICIAN') return '';
        const startStr = gantt.date.date_to_str('%H:%i')(start);
        const endStr = gantt.date.date_to_str('%H:%i')(end);
        let html = '<b>' + task.text + '</b><br/>';
        html += 'Time: ' + startStr + ' - ' + endStr + '<br/>';
        html += 'Status: ' + (task.status || 'N/A') + '<br/>';
        html += 'Type: ' + (task.taskType || 'N/A') + '<br/>';
        if (task.travelTimeMinutes) {
          html += 'Travel: ' + task.travelTimeMinutes + ' min<br/>';
        }
        if (task.notes) {
          html += 'Notes: ' + task.notes + '<br/>';
        }
        return html;
      };

      // Make parent (technician) rows non-draggable
      gantt.attachEvent('onBeforeTaskDrag', function(id, mode, e) {
        var task = gantt.getTask(id);
        if (task.taskType === 'TECHNICIAN') return false;
        return true;
      });

      // Handle task drag (move/resize) to persist changes
      gantt.attachEvent('onAfterTaskDrag', function(id, mode, e) {
        var task = gantt.getTask(id);
        if (task.taskType === 'TECHNICIAN') return;
        if (task.assignmentId) {
          var startStr = formatDateTime(task.start_date);
          var endStr = formatDateTime(task.end_date);
          updateAssignment(task.assignmentId, {
            startTime: startStr,
            endTime: endStr,
            status: task.status,
          }).then(function() {
            showToast('Assignment updated: ' + task.text);
          }).catch(function(err) {
            console.error('Failed to update assignment:', err);
            showToast('Failed to update assignment', 'error');
          });
        }
      });

      // Double-click to edit status
      gantt.attachEvent('onTaskDblClick', function(id, e) {
        var task = gantt.getTask(id);
        if (task.taskType === 'TECHNICIAN') return false;
        if (!task.assignmentId) return false;

        var newStatus = prompt(
          'Update status for: ' + task.text + '\nCurrent: ' + task.status + '\n\nEnter new status (SCHEDULED, IN_PROGRESS, COMPLETED):',
          task.status
        );

        if (newStatus && ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(newStatus.toUpperCase())) {
          newStatus = newStatus.toUpperCase();
          updateAssignment(task.assignmentId, {
            status: newStatus
          }).then(function() {
            task.status = newStatus;
            gantt.updateTask(id);
            showToast('Status updated to ' + newStatus);
          }).catch(function(err) {
            console.error('Failed to update status:', err);
            showToast('Failed to update status', 'error');
          });
        }
        return false;
      });

      gantt.init(ganttContainer.current);
      initialized.current = true;
    }

    // Load data
    loadData();

    function loadData() {
      setLoading(true);
      setError(null);

      getGanttData(territoryId, marketIds, date)
        .then(function(res) {
          var data = res.data;
          var tasks = [];

          if (data.data && data.data.length > 0) {
            var dateObj = new Date(date + 'T00:00:00');

            data.data.forEach(function(item) {
              if (item.taskType === 'TECHNICIAN') {
                tasks.push({
                  id: 'tech_' + item.technicianId,
                  text: item.text,
                  type: gantt.config.types.project,
                  taskType: 'TECHNICIAN',
                  technicianId: item.technicianId,
                  open: true,
                  render: 'split',
                });
              } else {
                var startDate = item.startDate ? new Date(item.startDate) : dateObj;
                var endDate = item.endDate ? new Date(item.endDate) : dateObj;

                tasks.push({
                  id: 'task_' + item.id,
                  text: item.text,
                  start_date: startDate,
                  end_date: endDate,
                  parent: 'tech_' + item.technicianId,
                  color: item.color,
                  taskType: item.taskType,
                  jobType: item.jobType,
                  status: item.status,
                  assignmentId: item.id,
                  jobId: item.jobId,
                  technicianId: item.technicianId,
                  travelTimeMinutes: item.travelTimeMinutes,
                  notes: item.notes,
                  progress: item.status === 'COMPLETED' ? 1 : item.status === 'IN_PROGRESS' ? 0.5 : 0,
                });
              }
            });
          }

          gantt.clearAll();
          gantt.parse({ data: tasks, links: [] });

          // Set the scale to show the working day (6 AM - 6 PM)
          var scaleStart = new Date(date + 'T06:00:00');
          var scaleEnd = new Date(date + 'T18:00:00');
          gantt.config.start_date = scaleStart;
          gantt.config.end_date = scaleEnd;
          gantt.render();

          setLoading(false);
        })
        .catch(function(err) {
          console.error('Failed to load gantt data:', err);
          setError('Failed to load schedule data. Please ensure the backend is running.');
          setLoading(false);
        });
    }
  }, [territoryId, marketIds, date, showToast]);

  return (
    <div className="gantt-container">
      {loading && <div className="gantt-loading">Loading schedule...</div>}
      {error && <div className="gantt-error">{error}</div>}
      <div
        ref={ganttContainer}
        style={{ width: '100%', height: '600px', display: loading || error ? 'none' : 'block' }}
      />
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}

function formatDateTime(date) {
  var d = new Date(date);
  var year = d.getFullYear();
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  var hours = String(d.getHours()).padStart(2, '0');
  var minutes = String(d.getMinutes()).padStart(2, '0');
  var seconds = String(d.getSeconds()).padStart(2, '0');
  return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds;
}

export default GanttChart;
