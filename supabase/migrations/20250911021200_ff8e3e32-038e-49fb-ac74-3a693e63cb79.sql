-- Drop existing view and create the stable, explicit orders_public_api view
drop view if exists public.orders_public_api;

create view public.orders_public_api as
select
  o.id,
  o.created_at,
  o."timestamp" as legacy_timestamp,

  -- submitter
  o.name,
  coalesce(nullif(o.full_name, ''), o.name) as full_name,

  -- human-readable locations
  o.store,
  o.plant,

  -- canonical codes
  o.store_number,
  o.plant_code,

  -- classification & source
  o.order_type,
  coalesce(o.source, 'web') as source,

  -- product & qty
  o.product_number,
  o.description,
  o.quantity,

  -- scheduling & notes
  o.schedule_arrival,
  o.notes,

  -- destination & comms
  o.destination_plant,
  o.email,
  o.destination_manager_email,

  -- status
  o.status,
  o.status_updated_at,

  -- idempotency & metadata
  o.idempotency_key,
  coalesce(o.metadata, '{}'::jsonb) as metadata,

  -- stub (requested)
  null::text as priority,

  -- cross-dock (alias keeps UI stable)
  o.is_cross_dock as cross_dock,
  o.cross_dock_type,
  o.cross_dock_destination,
  o.cross_dock_receiver_number,
  o.cross_dock_eta_date,
  o.cross_dock_origin,
  o.cross_dock_qty,
  o.cross_dock_part_number,
  o.cross_dock_description,
  o.cross_dock_notes,
  o.cross_dock_status,
  o.cross_dock_form_link,
  o.cross_dock_form_id,
  o.cross_dock_form_url,
  o.cross_dock_snapshot,
  o.cross_dock_received_notified_at,

  -- invoice & links
  o.invoice_number,
  o.pull_sheet_link,
  o.order_completion_link,

  -- lifecycle
  o.completed,
  o.completed_at,
  o.completed_by,
  o.archived,
  o.reopened_at,
  o.reopened_reason,
  o.received_at,
  o.in_transit_at,
  o.ready_to_ship_at,
  o.store_response_status,
  o.store_response_date,
  o.manual_override_allowed,
  o.manual_override_reason,
  o.response_deadline,

  -- warehouse
  o.received_at_warehouse,
  o.warehouse_received,

  -- misc
  o.manager_notes,
  o.store_manager_message,
  o.tire_pull_status,
  o.transfer_route,
  o.carrier,

  -- cross-plant routing IDs (for OT visibility)
  o.ordering_store,
  o.ordering_plant,
  o.origin_ot_id,
  o.destination_ot_id,
  o.destination_kind,
  o.role,
  o.origin_region_id,
  o.destination_region_id

from public.orders o
where o.deleted_at is null;

-- Grant permissions
grant select on public.orders_public_api to anon, authenticated, service_role;