import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface ScheduleEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
}

interface ScheduleCalendarProps {
  events: ScheduleEvent[];
  onSelectSlot: (slotInfo: SlotInfo) => void;
  onSelectEvent: (event: ScheduleEvent) => void;
  eventPropGetter?: (event: ScheduleEvent, start: Date, end: Date, isSelected: boolean) => { style?: React.CSSProperties };
}

const CustomEvent = ({ event }: { event: ScheduleEvent }) => {
  // Function to format time, e.g., "14:30"
  const formatTime = (date: Date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  // Don't show time for all-day events (like diary entries)
  if (event.allDay) {
    return <span>{event.title}</span>;
  }

  return (
    <div>
      <strong>{event.title}</strong>
      <br />
      <small>{formatTime(event.start)} - {formatTime(event.end)}</small>
      {event.resource?.description && (
        <>
          <br />
          <small><em>{event.resource.description}</em></small>
        </>
      )}
    </div>
  );
};

const ScheduleCalendar = ({ events, onSelectSlot, onSelectEvent, eventPropGetter }: ScheduleCalendarProps) => (
  <div style={{ height: 600 }}>
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      selectable
      onSelectSlot={onSelectSlot}
      onSelectEvent={onSelectEvent}
      eventPropGetter={eventPropGetter}
      components={{
        event: CustomEvent,
      }}
    />
  </div>
);

export default ScheduleCalendar;
