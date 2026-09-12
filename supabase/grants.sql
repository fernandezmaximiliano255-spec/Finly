-- Permisos mínimos para que usuarios autenticados usen las tablas de Finly.
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.movements to authenticated;
